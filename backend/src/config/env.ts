/**
 * Validación de variables de entorno críticas
 * Se ejecuta al inicio de la aplicación
 */

function validateEnvVar(name: string, value: string | undefined, required: boolean = true): string {
  if (required && (!value || value.trim() === '')) {
    throw new Error(`❌ Variable de entorno requerida faltante: ${name}`);
  }
  if (value && value.trim() === '') {
    throw new Error(`❌ Variable de entorno ${name} está vacía`);
  }
  return value!;
}

function validateJWTSecret(secret: string | undefined): string {
  const validated = validateEnvVar('JWT_SECRET', secret, true);
  
  // En producción, validar que no sea el valor por defecto
  if (process.env.NODE_ENV === 'production') {
    if (validated === 'dev_secret_change_me' || validated.length < 32) {
      throw new Error(
        '❌ JWT_SECRET inseguro en producción. Debe tener al menos 32 caracteres y no ser el valor por defecto.'
      );
    }
  }
  
  return validated;
}

export function validateEnvironmentVariables() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Variables críticas siempre requeridas
  const DATABASE_URL = validateEnvVar('DATABASE_URL', process.env.DATABASE_URL);
  const JWT_SECRET = validateJWTSecret(process.env.JWT_SECRET);
  
  // Variables con valores por defecto pero que deben validarse
  const REDIS_URL = validateEnvVar('REDIS_URL', process.env.REDIS_URL, false) || 'redis://127.0.0.1:6379';
  
  // Validar formato de DATABASE_URL
  if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
    throw new Error('❌ DATABASE_URL debe ser una URL de PostgreSQL válida');
  }
  
  // Validar formato de REDIS_URL
  if (!REDIS_URL.startsWith('redis://') && !REDIS_URL.startsWith('rediss://')) {
    throw new Error('❌ REDIS_URL debe ser una URL de Redis válida');
  }
  
  if (isProduction) {
    console.log('✅ Variables de entorno validadas correctamente');
  }
  
  return {
    DATABASE_URL,
    JWT_SECRET,
    REDIS_URL,
  };
}

