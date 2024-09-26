import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Ensure the path to .env is correct

const bucketName = process.env.BUCKET_NAME; // Load the bucket name from env
console.log('Bucket Name:', bucketName); // Check the bucket name

const storage = new Storage();

async function testConnection() {
  try {
    const [files] = await storage.bucket(bucketName).getFiles(); // Get files from the bucket

    const fileCount = new Set(); // Use a Set to store unique file names
    const folderCount = new Set(); // Use a Set to store unique folder paths

    // Process each file
    files.forEach(file => {
      const pathParts = file.name.split('/'); // Split the file name into parts

      // Increment the file count for the file itself (only if it is not a folder)
      const fileName = pathParts.pop(); // Get the file name
      if (fileName) {
        fileCount.add(fileName); // Add the file name to the Set
      }

      // Increment folder count for each part of the path
      pathParts.reduce((parentPath, part) => {
        const folderPath = `${parentPath}${part}/`;
        folderCount.add(folderPath); // Add the folder path to the Set
        return folderPath;
      }, '');
    });

    console.log('Files and folders in bucket:');
    
    // Log files
    fileCount.forEach(file => {
      console.log(`File: ${file}`);
    });

    // Log folders
    folderCount.forEach(folder => {
      console.log(`Folder: ${folder}`);
    });

    // Print counts
    console.log(`Total Files: ${fileCount.size}`);
    console.log(`Total Folders: ${folderCount.size}`);
  } catch (error) {
    console.error('Error accessing bucket:', error.message);
  }
}

testConnection();
