import React, { useState, useEffect } from 'react';
import api, { getMediaUrl } from '../../services/api';
import FileUploader from '../../components/Admin/FileUploader';
import { Trash2, Copy } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const MediaGallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showSuccess, showError, showInfo, confirm } = useNotification();

  const fetchMedia = async () => {
    try {
      const { data } = await api.get('/media');
      setMedia(data.media);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess('File uploaded successfully');
      fetchMedia(); // Refresh gallery
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Media',
      message: 'Are you sure you want to delete this file? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });

    if (isConfirmed) {
      try {
        await api.delete(`/media/${id}`);
        setMedia(media.filter(m => m._id !== id));
        showSuccess('File deleted');
      } catch (error) {
        console.error('Error deleting media:', error);
        showError('Delete failed');
      }
    }
  };

  const copyToClipboard = (url) => {
    // Construct full URL if needed, or just relative
    navigator.clipboard.writeText(getMediaUrl(url));
    showInfo('URL copied to clipboard!');
  };

  if (loading) return <div>Loading media...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Media Gallery</h1>

      <div className="bg-white p-6 rounded-lg border border-border shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">Upload New Media</h2>
        <FileUploader onFileSelect={handleUpload} />
        {uploading && <p className="text-sm mt-2 text-gray-dark">Uploading...</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media.map((item) => (
          <div key={item._id} className="bg-white border border-border rounded-lg overflow-hidden group">
            <div className="h-48 bg-gray-light flex items-center justify-center relative">
              {item.type === 'video' ? (
                <video src={getMediaUrl(item.url)} className="max-h-full object-contain" />
              ) : (
                <img src={getMediaUrl(item.url)} alt={item.filename} className="max-h-full object-contain" />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => copyToClipboard(item.url)}
                  className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors"
                  title="Copy URL"
                >
                  <Copy size={20} className="text-black" />
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-3 text-sm truncate">
              <p className="font-medium text-black truncate" title={item.filename}>{item.filename}</p>
              <p className="text-xs text-gray-dark mt-1">{(item.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ))}
      </div>
      
      {media.length === 0 && (
        <p className="text-center text-gray-dark py-10">No media uploaded yet.</p>
      )}
    </div>
  );
};

export default MediaGallery;
