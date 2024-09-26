import React, { useState } from 'react';
import FileDownloader from '../../FileDownloader';

const Download: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Manage open/close state

  const handleToggleClick = () => {
    setIsOpen(prevState => !prevState); // Toggle open/close state
  };

  return (
    <div className="flex-wrapper">
      {/* Download Button */}
      <button className="download-button" onClick={handleToggleClick}>
        <i className="fa fa-download"></i>
      </button>

      {/* File Downloader */}
      {isOpen && ( // Render FileDownloader only when open
        <div className="file-downloader">
          <FileDownloader /> {/* Render FileDownloader */}
        </div>
      )}
    </div>
  );
};

export default Download;
