import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

const FileUploader = ({ onFileSelect, accept = "image/*,video/*" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileType(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragActive ? "border-black bg-gray-light" : "border-border hover:border-gray-dark"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-dark mb-4" />
          <p className="text-sm text-gray-dark mb-2">
            <span className="font-semibold text-black">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-dark">Images or Videos (max 50MB)</p>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border inline-block">
          {fileType === 'video' ? (
            <video src={preview} controls className="max-h-64 object-contain bg-black" />
          ) : (
            <img src={preview} alt="Preview" className="max-h-64 object-contain bg-gray-light" />
          )}
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-light transition-colors"
          >
            <X size={16} className="text-black" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
