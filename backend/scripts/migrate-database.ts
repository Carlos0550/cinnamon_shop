/**
 * Script de Migración de Base de Datos
 * 
 * Este script migra todos los registros de una base de datos PostgreSQL origen
 * (Supabase) a una base de datos PostgreSQL destino.
 * 
 * Uso: npx ts-node-dev --transpile-only -r tsconfig-paths/register scripts/migrate-database.ts
 */

import { Pool } from 'pg';

// ============================================================================
// CONFIGURACIÓN - MODIFICAR ESTAS VARIABLES
// ============================================================================

// Base de datos ORIGEN (Supabase)
const SOURCE_DB = {
  host: '',
  port: 5432,
  database: 'postgres',
  user: '',
  password: '',
  ssl: { rejectUnauthorized: false }
};

// Base de datos DESTINO (Railway)
const DEST_DB = {
  host: '',
  port: 10187,
  database: 'railway',
  user: 'postgres',
  password: '',
  ssl: { rejectUnauthorized: false }
};

// ============================================================================
// ORDEN DE MIGRACIÓN (respetando foreign keys)
// ============================================================================

const MIGRATION_ORDER = [
  // Tablas sin dependencias
  'User',
  'Admin',
  'Categories',
  'ColorPalette',
  'FAQ',
  'BusinessData',
  
  // Tablas con dependencias simples
  'BusinessBankData',  // depende de BusinessData
  'Products',          // depende de Categories
  'Promos',            // depende de User (createdById)
  'Cart',              // depende de User
  
  // Tablas con múltiples dependencias
  'Sales',             // depende de User, Products
  'OrderItems',        // depende de Cart, Products
  'Orders',            // depende de User, Promos, Sales
];

// Tablas many-to-many (relaciones implícitas de Prisma)
const RELATION_TABLES = [
  '_CategoriesToPromos',
  '_ProductsToPromos',
  '_ProductsToSales',
];

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

async function getTableColumns(pool: Pool, tableName: string): Promise<string[]> {
  const result = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 
    AND table_schema = 'public'
    ORDER BY ordinal_position
  `, [tableName]);
  return result.rows.map(row => row.column_name);
}

async function getTableCount(pool: Pool, tableName: string): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
  return parseInt(result.rows[0].count);
}

async function resetSequence(pool: Pool, tableName: string, columnName: string): Promise<void> {
  try {
    // Obtener el nombre de la secuencia
    const seqResult = await pool.query(`
      SELECT pg_get_serial_sequence('"${tableName}"', '${columnName}') as seq_name
    `);
    
    const seqName = seqResult.rows[0]?.seq_name;
    if (seqName) {
      // Obtener el valor máximo actual
      const maxResult = await pool.query(`SELECT COALESCE(MAX("${columnName}"), 0) as max_val FROM "${tableName}"`);
      const maxVal = parseInt(maxResult.rows[0].max_val) || 0;
      
      // Resetear la secuencia
      await pool.query(`SELECT setval('${seqName}', $1, true)`, [Math.max(maxVal, 1)]);
      console.log(`  ✓ Secuencia ${seqName} reiniciada a ${maxVal}`);
    }
  } catch (error) {
    // Ignorar errores si no hay secuencia
  }
}

// Columnas que son de tipo JSON en el esquema
const JSON_COLUMNS = ['images', 'tags', 'options', 'items', 'manualProducts', 'paymentMethods', 'selected_options'];

// Columnas que son arrays nativos de PostgreSQL (String[])
const ARRAY_COLUMNS = ['colors'];

function serializeValue(value: any, columnName: string): any {
  if (value === null || value === undefined) return value;
  
  // Si es una columna de array nativo de PostgreSQL
  if (ARRAY_COLUMNS.includes(columnName)) {
    // Si viene como string JSON, parsearlo a array
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    // Si ya es un array, devolverlo tal cual
    return value;
  }
  
  // Si es una columna JSON y el valor es un objeto/array, serializarlo
  if (JSON_COLUMNS.includes(columnName) && typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value;
}

async function migrateTable(
  sourcePool: Pool,
  destPool: Pool,
  tableName: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log(`\n📦 Migrando tabla: ${tableName}`);
    
    // Obtener columnas
    const columns = await getTableColumns(sourcePool, tableName);
    if (columns.length === 0) {
      console.log(`  ⚠️ Tabla no encontrada o vacía en origen`);
      return { success: true, count: 0 };
    }
    
    // Contar registros en origen
    const sourceCount = await getTableCount(sourcePool, tableName);
    console.log(`  📊 Registros en origen: ${sourceCount}`);
    
    if (sourceCount === 0) {
      console.log(`  ⏭️ Tabla vacía, saltando...`);
      return { success: true, count: 0 };
    }
    
    // Leer todos los registros del origen
    const columnsStr = columns.map(c => `"${c}"`).join(', ');
    const sourceData = await sourcePool.query(`SELECT ${columnsStr} FROM "${tableName}"`);
    
    // Limpiar tabla destino
    await destPool.query(`DELETE FROM "${tableName}"`);
    
    // (foreign keys ya deshabilitadas a nivel de sesión)
    
    // Insertar registros en lotes
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < sourceData.rows.length; i += BATCH_SIZE) {
      const batch = sourceData.rows.slice(i, i + BATCH_SIZE);
      
      for (const row of batch) {
        // Serializar valores JSON correctamente
        const values = columns.map(col => serializeValue(row[col], col));
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        
        try {
          await destPool.query(
            `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders})`,
            values
          );
          inserted++;
        } catch (insertError: any) {
          console.error(`  ❌ Error insertando registro:`, insertError.message);
        }
      }
      
      console.log(`  ⏳ Progreso: ${Math.min(i + BATCH_SIZE, sourceData.rows.length)}/${sourceData.rows.length}`);
    }
    
    // (foreign keys se rehabilitarán al final de la migración)
    
    // Resetear secuencias para tablas con ID autoincremental
    if (columns.includes('id')) {
      await resetSequence(destPool, tableName, 'id');
    }
    
    console.log(`  ✅ Migrados: ${inserted} registros`);
    return { success: true, count: inserted };
    
  } catch (error: any) {
    console.error(`  ❌ Error migrando ${tableName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

async function migrateRelationTable(
  sourcePool: Pool,
  destPool: Pool,
  tableName: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log(`\n🔗 Migrando relación: ${tableName}`);
    
    // Verificar si la tabla existe en origen
    const checkResult = await sourcePool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      ) as exists
    `, [tableName]);
    
    if (!checkResult.rows[0].exists) {
      console.log(`  ⚠️ Tabla de relación no encontrada en origen`);
      return { success: true, count: 0 };
    }
    
    // Las tablas de relación de Prisma tienen columnas A y B
    const sourceData = await sourcePool.query(`SELECT "A", "B" FROM "${tableName}"`);
    
    if (sourceData.rows.length === 0) {
      console.log(`  ⏭️ Sin relaciones, saltando...`);
      return { success: true, count: 0 };
    }
    
    // Limpiar tabla destino
    await destPool.query(`DELETE FROM "${tableName}"`);
    
    // Insertar relaciones
    let inserted = 0;
    for (const row of sourceData.rows) {
      try {
        await destPool.query(
          `INSERT INTO "${tableName}" ("A", "B") VALUES ($1, $2)`,
          [row.A, row.B]
        );
        inserted++;
      } catch (error: any) {
        console.error(`  ❌ Error insertando relación:`, error.message);
      }
    }
    
    console.log(`  ✅ Migradas: ${inserted} relaciones`);
    return { success: true, count: inserted };
    
  } catch (error: any) {
    console.error(`  ❌ Error migrando ${tableName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('🚀 MIGRACIÓN DE BASE DE DATOS');
  console.log('═'.repeat(60));
  console.log(`\n📍 Origen: ${SOURCE_DB.host}:${SOURCE_DB.port}/${SOURCE_DB.database}`);
  console.log(`📍 Destino: ${DEST_DB.host}:${DEST_DB.port}/${DEST_DB.database}`);
  
  // Crear conexiones
  const sourcePool = new Pool(SOURCE_DB);
  const destPool = new Pool(DEST_DB);
  
  try {
    // Probar conexiones
    console.log('\n🔌 Probando conexiones...');
    await sourcePool.query('SELECT 1');
    console.log('  ✓ Conexión a origen exitosa');
    await destPool.query('SELECT 1');
    console.log('  ✓ Conexión a destino exitosa');
    
    // Deshabilitar foreign keys para toda la migración
    console.log('\n🔓 Deshabilitando verificación de foreign keys...');
    await destPool.query(`SET session_replication_role = replica`);
    
    // Estadísticas
    const stats = {
      tablesSuccess: 0,
      tablesFailed: 0,
      totalRecords: 0,
    };
    
    // Migrar tablas principales
    console.log('\n' + '─'.repeat(60));
    console.log('📋 MIGRANDO TABLAS PRINCIPALES');
    console.log('─'.repeat(60));
    
    for (const tableName of MIGRATION_ORDER) {
      const result = await migrateTable(sourcePool, destPool, tableName);
      if (result.success) {
        stats.tablesSuccess++;
        stats.totalRecords += result.count;
      } else {
        stats.tablesFailed++;
      }
    }
    
    // Migrar tablas de relación
    console.log('\n' + '─'.repeat(60));
    console.log('🔗 MIGRANDO TABLAS DE RELACIÓN');
    console.log('─'.repeat(60));
    
    for (const tableName of RELATION_TABLES) {
      const result = await migrateRelationTable(sourcePool, destPool, tableName);
      if (result.success) {
        stats.tablesSuccess++;
        stats.totalRecords += result.count;
      } else {
        stats.tablesFailed++;
      }
    }
    
    // Rehabilitar foreign keys
    console.log('\n🔒 Rehabilitando verificación de foreign keys...');
    await destPool.query(`SET session_replication_role = DEFAULT`);
    
    // Resumen
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('═'.repeat(60));
    console.log(`  ✅ Tablas migradas exitosamente: ${stats.tablesSuccess}`);
    console.log(`  ❌ Tablas con errores: ${stats.tablesFailed}`);
    console.log(`  📦 Total de registros migrados: ${stats.totalRecords}`);
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error fatal durante la migración:', error);
    process.exit(1);
  } finally {
    // Cerrar conexiones
    await sourcePool.end();
    await destPool.end();
    console.log('\n🔌 Conexiones cerradas');
  }
}

// Ejecutar
main().catch(console.error);

