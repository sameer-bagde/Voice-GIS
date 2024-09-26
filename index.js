import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current module's filename and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;

// Endpoint to list all folders and files in the root
app.get('/folders', async (req, res) => {
  try {
    const [files] = await storage.bucket(bucketName).getFiles();
    const folders = new Set();
    const filesInFolders = {};
    const rootFiles = [];

    files.forEach(file => {
      const parts = file.name.split('/');
      if (parts.length > 1) {
        // This is a file in a folder
        const folderName = parts[0];
        folders.add(folderName);
        if (!filesInFolders[folderName]) {
          filesInFolders[folderName] = [];
        }
        // Only add files, not subfolders
        if (parts.length === 2 && !file.name.endsWith('/')) {
          filesInFolders[folderName].push(file.name);
        }
      } else {
        // This is a root-level file
        rootFiles.push(file.name);
      }
    });

    // Build the response structure
    const response = {
      folders: [...folders].map(folder => ({
        name: folder,
        isEmpty: !filesInFolders[folder] || filesInFolders[folder].length === 0
      })),
      filesInFolders: filesInFolders,
      rootFiles: rootFiles,
    };

    console.log('Response data:', JSON.stringify(response, null, 2));

    res.json(response);
  } catch (error) {
    console.error('Error fetching folders and files:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// New endpoint to fetch all files in the bucket (excluding folders)
app.get('/files', async (req, res) => {
  try {
    const [files] = await storage.bucket(bucketName).getFiles();
    const rootFiles = files.filter(file => !file.name.includes('/'));
    const fileUrls = await Promise.all(
      rootFiles.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // URL valid for 15 minutes
        });
        return { name: file.name, url: signedUrl };
      })
    );
    res.json(fileUrls);
  } catch (error) {
    console.error('Error fetching root files:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
