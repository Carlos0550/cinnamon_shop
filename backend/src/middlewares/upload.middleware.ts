import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

// Asegurarse de que el directorio de uploads exista
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración básica de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para validar tipos de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceptar todos los archivos por defecto
  cb(null, true);
};

// Crear instancia básica de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB por defecto
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Archivo demasiado grande',
        message: 'El tamaño del archivo excede el límite permitido'
      });
    }
    return res.status(400).json({ 
      error: 'Error al subir archivo',
      message: err.message
    });
  }
  next(err);
};

// Función para crear un middleware de carga de un solo archivo
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Función para crear un middleware de carga de múltiples archivos
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Función para crear un middleware de carga de múltiples campos
export const uploadFields = (fields: { name: string, maxCount: number }[]) => 
  upload.fields(fields);