import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno necesarias estén definidas
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'images';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error de configuración de Supabase: Faltan variables de entorno', { 
    missing: {
      url: !SUPABASE_URL,
      key: !SUPABASE_KEY
    }
  });
}

// Crear cliente de Supabase
export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_KEY || ''
);

export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = '',
  contentType?: string
): Promise<{ url: string | null; error: any }> {
  try {
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    console.log("SUPABASE BUCKET", SUPABASE_BUCKET)
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        contentType: contentType || 'application/octet-stream'
      });
    
    if (error) {
      console.error('Error al subir imagen a Supabase:', { error, fileName, folder });
      return { url: null, error };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Excepción al subir imagen a Supabase:', { error, fileName, folder });
    return { url: null, error };
  }
}

export async function deleteImage(filePath: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Error al eliminar imagen de Supabase:', { error, filePath });
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Excepción al eliminar imagen de Supabase:', { error, filePath });
    return { success: false, error };
  }
}

export function getImageUrl(filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);
  
  return publicUrl;
}