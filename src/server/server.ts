/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import * as Minio from 'minio';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
interface FileFormat {
  originalName: string;
  fileName: string;
  size: number;
  content: any; // שונה מ-JSON ל-any כדי למנוע שגיאות טיפוסיות
  minioUrl: string;
}

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:4200',
      'http://localhost:5000',
      'http://localhost',
      'http://127.0.0.1',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const JSON_BUCKET = 'workflows';
const AUDIO_BUCKET = 'audio-files';

// יצירת תיקייה זמנית לקבצים אם אינה קיימת
const TEMP_DIR = path.join(__dirname, 'uploads', 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Initialize buckets
async function initializeBuckets() {
  for (const bucket of [JSON_BUCKET, AUDIO_BUCKET]) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Bucket ${bucket} created`);
    }
  }
}

// Configure multer for disk storage to prevent memory overload and allow FFmpeg processing
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, TEMP_DIR);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // הועלה ל-50MB כדי לאפשר קבצי מקור גדולים
    files: 20,
  },
});

// Main endpoint: Process files, convert audio, and upload to MinIO
app.post(
  '/upload-files',
  upload.array('files'),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const results = {
        jsonFiles: [] as FileFormat[],
        otherFiles: [] as string[],
        uploadedToMinIO: {
          jsonFiles: [] as string[],
          otherFiles: [] as string[],
        },
      };

      for (const file of files) {
        const cleanOriginalName = file.originalname.replace(
          /[^a-zA-Z0-9.\-_]/g,
          '_'
        );

        const fileName = `${Date.now()}-${cleanOriginalName}`;

        const isJson =
          file.mimetype === 'application/json' ||
          file.originalname.toLowerCase().endsWith('.json');

        if (isJson) {
          try {
            // קריאת הקובץ מהדיסק
            const fileContent = fs.readFileSync(file.path, 'utf-8');
            const jsonData = JSON.parse(fileContent);

            // העלאת הקובץ ישירות מהדיסק ל-MinIO
            await minioClient.fPutObject(JSON_BUCKET, fileName, file.path, {
              'Content-Type': 'application/json',
              'X-Original-Name': file.originalname,
              'X-Upload-Date': new Date().toISOString(),
            });

            results.jsonFiles.push({
              originalName: file.originalname,
              fileName: fileName,
              size: file.size,
              content: jsonData,
              minioUrl: `${process.env.VITE_MINIO_URL || 'http://localhost:9000'}/${JSON_BUCKET}/${fileName}`,
            });

            results.uploadedToMinIO.jsonFiles.push(fileName);
          } catch (error) {
            console.error(
              `Failed to process JSON file ${file.originalname}:`,
              error
            );
          } finally {
            // ניקוי הקובץ הזמני
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          }
        } else {
          // טיפול והמרה של קבצי שמע בעזרת FFmpeg
          const outputFileName = `${file.filename}.wav`;
          const outputPath = path.join(TEMP_DIR, outputFileName);
          const finalMinioName = `${Date.now()}-converted_${cleanOriginalName}.wav`;

          try {
            // עטיפת תהליך ההמרה ב-Promise
            await new Promise<void>((resolve, reject) => {
              ffmpeg(file.path)
                .audioFrequency(8000)
                .audioChannels(1)
                .audioCodec('pcm_s16le')
                .format('wav')
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
            });

            const stat = fs.statSync(outputPath);

            // העלאת הקובץ המומר ל-MinIO
            await minioClient.fPutObject(
              AUDIO_BUCKET,
              finalMinioName,
              outputPath,
              {
                'Content-Type': 'audio/wav',
                'X-Original-Name': file.originalname,
                'X-Upload-Date': new Date().toISOString(),
              }
            );

            results.otherFiles.push(file.originalname);
            results.uploadedToMinIO.otherFiles.push(finalMinioName);
          } catch (error) {
            console.error(
              `Failed to process audio file ${file.originalname}:`,
              error
            );
          } finally {
            // ניקוי הקובץ המקורי והקובץ המומר מהשרת
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          }
        }
      }

      res.json({
        success: true,
        message: `Processed ${files.length} files`,
        data: results,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

app.get('/json-files-metadata', async (_req: Request, res: Response) => {
  try {
    const fileMetadata = [];
    const stream = minioClient.listObjects(JSON_BUCKET, '', true);

    for await (const obj of stream) {
      if (obj.name) {
        try {
          const stat = await minioClient.statObject(JSON_BUCKET, obj.name);
          const originalName = stat.metaData?.['x-original-name'] || obj.name;

          fileMetadata.push({
            fileName: obj.name,
            originalName: originalName,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        } catch (error) {
          fileMetadata.push({
            fileName: obj.name,
            originalName: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        }
      }
    }

    res.json({ count: fileMetadata.length, files: fileMetadata });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list JSON file metadata' });
  }
});

app.get('/audio-files-metadata', async (_req: Request, res: Response) => {
  try {
    const fileMetadata = [];
    const stream = minioClient.listObjects(AUDIO_BUCKET, '', true);

    for await (const obj of stream) {
      if (obj.name) {
        try {
          // תוקן: קריאה מ-AUDIO_BUCKET במקום JSON_BUCKET
          const stat = await minioClient.statObject(AUDIO_BUCKET, obj.name);
          const originalName = stat.metaData?.['x-original-name'] || obj.name;

          fileMetadata.push({
            fileName: obj.name,
            originalName: originalName,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        } catch (error) {
          fileMetadata.push({
            fileName: obj.name,
            originalName: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        }
      }
    }

    res.json({ count: fileMetadata.length, files: fileMetadata });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list audio file metadata' });
  }
});

app.get('/json/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const stream = await minioClient.getObject(JSON_BUCKET, filename);

    let data = '';
    stream.on('data', chunk => (data += chunk));
    stream.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        res.json({ filename: filename, content: jsonData });
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON file' });
      }
    });
    stream.on('error', _error => {
      res.status(500).json({ error: 'Failed to read file' });
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.delete('/json/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params as { filename: string };

  if (!filename) {
    return res.status(400).json({ success: false, error: 'Missing filename' });
  }

  try {
    await minioClient.removeObject(JSON_BUCKET, filename);
    return res.status(200).json({
      success: true,
      message: `Deleted '${filename}' from '${JSON_BUCKET}'`,
    });
  } catch (error) {
    console.error('Error deleting object:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to delete object' });
  }
});

// Error handling middleware
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files (max 20)' });
    }
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await initializeBuckets();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`MinIO Console: http://localhost:9001`);
      console.log(`\nEndpoints:`);
      console.log(
        `POST /upload-files - Upload files (JSON + Audio with conversion)`
      );
      console.log(`GET /json-files-metadata - List all JSON files metadata`);
      console.log(`GET /audio-files-metadata - List all audio files metadata`);
      console.log(`GET /json/:filename - Get specific JSON file`);
      console.log(`DELETE /json/:filename - Delete specific JSON file`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
