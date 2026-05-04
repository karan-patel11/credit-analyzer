import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon, XIcon, CheckIcon } from '../../utils/icons';

const FileUpload = ({ file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert("Please upload a CSV file.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div className="tempo-label">Bank Statement</div>
      
      {!file ? (
        <div 
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed p-6 transition-all-fast
            ${isDragging 
              ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' 
              : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className={`mb-3 h-8 w-8 transition-colors-fast ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
          <div className={`mb-1 text-[13px] font-medium transition-colors-fast ${isDragging ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            Drop CSV here or click to browse
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)]">Supports .csv files</div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <FileIcon className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <div className="overflow-hidden">
              <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">{file.name}</div>
              <div className="flex items-center space-x-2 text-[11px] text-[var(--text-secondary)]">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span className="flex items-center text-[var(--status-approve)]">
                  <CheckIcon className="w-3 h-3 mr-0.5" /> Ready
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setFile(null)}
            className="rounded-full p-2 text-[var(--text-tertiary)] transition-colors-fast hover:bg-[var(--bg-secondary)] hover:text-[var(--status-decline)]"
            title="Remove file"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
