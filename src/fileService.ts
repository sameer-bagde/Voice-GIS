import axios from 'axios';

export const fetchFiles = async () => {
  try {
    const response = await axios.get('http://localhost:5000/files');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching files: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const fetchFolders = async () => {
  try {
    const response = await axios.get('http://localhost:5000/folders');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching folders: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};