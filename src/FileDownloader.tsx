import React, { useEffect, useState } from 'react';
import { fetchFiles, fetchFolders } from './fileService';

interface File {
  name: string;
  url: string;
}

interface Folder {
  name: string;
  isEmpty: boolean;
}

interface FoldersData {
  folders: Folder[];
  filesInFolders: { [key: string]: string[] };
  rootFiles: string[];
}

const FileDownloader: React.FC = () => {
  const [rootFiles, setRootFiles] = useState<File[]>([]);
  const [foldersData, setFoldersData] = useState<FoldersData>({
    folders: [],
    filesInFolders: {},
    rootFiles: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filesResponse, foldersResponse] = await Promise.all([
          fetchFiles(),
          fetchFolders(),
        ]);
        setRootFiles(filesResponse);
        setFoldersData(foldersResponse);
      } catch (error) {
        const err = error instanceof Error ? error.message : 'Unknown error';
        setError(`Error fetching data: ${err}`);
      }
    };

    fetchData();
  }, []);

  const toggleFolder = (folderName: string) => {
    setOpenFolder((prevFolder) => (prevFolder === folderName ? null : folderName));
  };

  const renderFolderContent = (folder: Folder) => {
    const folderFiles = foldersData.filesInFolders[folder.name] || [];

    if (folder.isEmpty) {
      return <p className="empty-folder-message">No files in the folder, it's empty</p>;
    }

    return (
      <ul className="folder-content">
        {folderFiles.map((fileName) => {
          const parts = fileName.split('/');
          return (
            <li key={fileName} className={parts.length === 2 ? '' : 'subfolder'}>
              {parts.length === 2 ? (
                <a href={`path/to/${fileName}`} download>
                  {parts[1]}
                </a>
              ) : (
                <span>📁 {parts[1]}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <section>
        {rootFiles.length > 0 ? (
          <ul className="file-list">
            {rootFiles.map((file) => (
              <li key={file.name}>
                <a href={file.url} download>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files found in the root directory.</p>
        )}
      </section>

      <section>
        {foldersData.folders.length > 0 ? (
          <ul className="folder-list">
            {foldersData.folders.map((folder) => (
              <li key={folder.name} className="folder">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFolder(folder.name)}
                  onKeyPress={(e) => e.key === 'Enter' && toggleFolder(folder.name)}
                  className="folder-header" // Use external styling class
                >
                  <span>{openFolder === folder.name ? '▼' : '▶'}</span>
                  <h3>{folder.name}</h3>
                </div>
                {openFolder === folder.name && renderFolderContent(folder)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No folders found.</p>
        )}
      </section>
    </div>
  );
};

export default FileDownloader;
