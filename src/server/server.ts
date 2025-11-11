/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import * as Minio from 'minio';
import multer from 'multer';

interface FileFormat {
  originalName: string;
  fileName: string;
  size: number;
  content: JSON;
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
    ], // Add your React app URLs
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

// Configure multer for memory storage (we'll handle MinIO upload ourselves)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20, // Max 20 files
  },
});

// Main endpoint: Process files and upload to MinIO
app.post(
  '/upload-files',
  upload.array('files'),
  async (req: Request, res: Response) => {
    try {
      // Type assertion for files array
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
        const isJson =
          file.mimetype === 'application/json' ||
          file.originalname.toLowerCase().endsWith('.json');

        const fileName = `${Date.now()}-${file.originalname}`;

        if (isJson) {
          try {
            // Parse JSON content
            const jsonData = JSON.parse(file.buffer.toString('utf-8'));

            // Upload JSON file to MinIO
            await minioClient.putObject(
              JSON_BUCKET,
              fileName,
              file.buffer,
              file.size,
              {
                'Content-Type': 'application/json',
                'X-Original-Name': file.originalname,
                'X-Upload-Date': new Date().toISOString(),
              }
            );

            results.jsonFiles.push({
              originalName: file.originalname,
              fileName: fileName,
              size: file.size,
              content: jsonData,
              minioUrl: `http://localhost:9000/${JSON_BUCKET}/${fileName}`,
            });

            results.uploadedToMinIO.jsonFiles.push(fileName);
          } catch (error) {
            console.error(
              `Failed to process JSON file ${file.originalname}:`,
              error
            );
          }
        } else {
          // Upload non-JSON file to MinIO
          await minioClient.putObject(
            AUDIO_BUCKET,
            fileName,
            file.buffer,
            file.size,
            {
              'Content-Type': file.mimetype,
              'X-Original-Name': file.originalname,
              'X-Upload-Date': new Date().toISOString(),
            }
          );

          results.otherFiles.push(file.originalname);
          results.uploadedToMinIO.otherFiles.push(fileName);
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

app.get('/json-files-metadata', async (req: Request, res: Response) => {
  try {
    const fileMetadata = [];
    const stream = minioClient.listObjects(JSON_BUCKET, '', true);

    for await (const obj of stream) {
      if (obj.name) {
        // Get original filename from metadata
        try {
          const stat = await minioClient.statObject(JSON_BUCKET, obj.name);
          const originalName = stat.metaData?.['x-original-name'] || obj.name;

          fileMetadata.push({
            fileName: obj.name,
            originalName: originalName,
            size: obj.size,
            lastModified: obj.lastModified,
            // NO content field - just metadata!
          });
        } catch (error) {
          // If stat fails, just use basic info
          fileMetadata.push({
            fileName: obj.name,
            originalName: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        }
      }
    }

    res.json({
      count: fileMetadata.length,
      files: fileMetadata,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list file metadata' });
  }
});

app.get('/audio-files-metadata', async (req: Request, res: Response) => {
  try {
    const fileMetadata = [];
    const stream = minioClient.listObjects(AUDIO_BUCKET, '', true);

    for await (const obj of stream) {
      if (obj.name) {
        // Get original filename from metadata
        try {
          const stat = await minioClient.statObject(JSON_BUCKET, obj.name);
          const originalName = stat.metaData?.['x-original-name'] || obj.name;

          fileMetadata.push({
            fileName: obj.name,
            originalName: originalName,
            size: obj.size,
            lastModified: obj.lastModified,
            // NO content field - just metadata!
          });
        } catch (error) {
          // If stat fails, just use basic info
          fileMetadata.push({
            fileName: obj.name,
            originalName: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        }
      }
    }

    res.json({
      count: fileMetadata.length,
      files: fileMetadata,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list file metadata' });
  }
});
// Get JSON file content from MinIO
app.get('/json/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const stream = await minioClient.getObject(JSON_BUCKET, filename);

    let data = '';
    stream.on('data', chunk => (data += chunk));
    stream.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        res.json({
          filename: filename,
          content: jsonData,
        });
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON file' });
      }
    });
    stream.on('error', error => {
      res.status(500).json({ error: 'Failed to read file' });
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.delete('/json/:filename', async (req: Request, res: Response) => {
  // this is what your route defines:
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
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
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
      console.log(`POST /upload-files - Upload files (JSON + others)`);
      console.log(`GET /json-files - List all JSON files with content`);
      console.log(`GET /other-files - List other file names`);
      console.log(`GET /json/:filename - Get specific JSON file`);
      console.log(`GET /download/:filename - Download other files`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
