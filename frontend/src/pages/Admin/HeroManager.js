import React, { useEffect, useState } from 'react';
import api, { getMediaUrl } from '../../services/api';
import { Film, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import FileUploader from '../../components/Admin/FileUploader';

const HeroManager = () => {
  const [hero, setHero] = useState({
    title: 'Redefining Luxury',
    subtitle: 'Discover the essentials of modern minimalism.',
    buttonText: 'Explore Collection',
    buttonLink: '/shop',
    mediaType: 'video',
    mediaId: null
  });
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchHeroAndMedia();
  }, []);

  const fetchHeroAndMedia = async () => {
    try {
      setLoading(true);
      const [heroRes, mediaRes] = await Promise.all([
        api.get('/hero'),
        api.get('/media')
      ]);

      const heroData = heroRes.data;
      // Normalize mediaId if it's an object from backend
      if (heroData.mediaId && typeof heroData.mediaId === 'object') {
        heroData.mediaId = heroData.mediaId._id || heroData.mediaId.id;
      }

      setHero(heroData);
      setMedia(mediaRes.data.media || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error loading hero data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHero(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (e) => {
    const { value, name } = e.target;
    if (name === 'mediaType') {
      setHero(prev => ({ ...prev, mediaType: value }));
    } else {
      setHero(prev => ({ ...prev, mediaId: value }));
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh media list
      const mediaRes = await api.get('/media');
      const newMedia = mediaRes.data.media || [];
      setMedia(newMedia);

      // The backend returns the media object directly
      const uploadedFile = data;
      
      if (uploadedFile) {
        setHero(prev => ({ 
          ...prev, 
          mediaId: uploadedFile._id || uploadedFile.id,
          mediaType: uploadedFile.type === 'video' ? 'video' : 'image'
        }));
        showSuccess('File uploaded and selected');
        setShowUploader(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      const response = await api.put('/hero', {
        title: hero.title,
        subtitle: hero.subtitle,
        buttonText: hero.buttonText,
        buttonLink: hero.buttonLink,
        mediaType: hero.mediaType,
        mediaId: hero.mediaId
      });

      const heroData = response.data;
      if (heroData.mediaId && typeof heroData.mediaId === 'object') {
        heroData.mediaId = heroData.mediaId._id || heroData.mediaId.id;
      }

      setHero(heroData);
      showSuccess('Hero section updated successfully!');
    } catch (error) {
      console.error('Error updating hero:', error);
      showError(error.response?.data?.message || 'Error updating hero section');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading hero data...</div>;

  const filteredMedia = media.filter(m => m.type === hero.mediaType);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Film size={32} />
        <h1 className="text-3xl font-serif font-bold">Hero Section Management</h1>
      </div>


      <div className="bg-white p-8 rounded-lg border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={hero.title}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={hero.subtitle}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Button Text</label>
            <input
              type="text"
              name="buttonText"
              value={hero.buttonText}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          {/* Button Link */}
          <div>
            <label className="block text-sm font-medium mb-2">Button Link</label>
            <input
              type="text"
              name="buttonLink"
              value={hero.buttonLink}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Media Type</label>
            <select
              name="mediaType"
              value={hero.mediaType}
              onChange={handleMediaChange}
              className="input-field"
              required
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Media Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                Media Asset
              </label>
              <button 
                type="button"
                onClick={() => setShowUploader(!showUploader)}
                className="text-xs font-semibold uppercase tracking-wider text-gray-dark hover:text-black flex items-center gap-1 transition-colors"
              >
                <Upload size={14} />
                {showUploader ? 'Select from Gallery' : 'Upload New'}
              </button>
            </div>

            {showUploader ? (
              <div className="bg-gray-light p-4 rounded-lg border border-border">
                <FileUploader onFileSelect={handleUpload} />
                {uploading && <p className="text-sm mt-2 text-gray-dark animate-pulse">Uploading and processing...</p>}
              </div>
            ) : (
              <div>
                <select
                  name="mediaId"
                  value={hero.mediaId || ''}
                  onChange={handleMediaChange}
                  className="input-field"
                  required
                >
                  <option value="">-- Choose a {hero.mediaType} --</option>
                  {filteredMedia.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.filename}
                    </option>
                  ))}
                </select>
                {filteredMedia.length === 0 && (
                  <p className="text-sm text-gray-dark mt-2">
                    No {hero.mediaType}s available. Click "Upload New" above.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Current Media Preview */}
          {hero.mediaId && (
            <div className="bg-gray-light p-4 rounded">
              <p className="text-sm text-gray-dark mb-3">Current {hero.mediaType}:</p>
              {hero.mediaType === 'video' ? (
                <video
                  src={getMediaUrl(media.find(m => m._id === hero.mediaId)?.url)}
                  controls
                  className="w-full max-h-48 rounded"
                />
              ) : (
                <img
                  src={getMediaUrl(media.find(m => m._id === hero.mediaId)?.url)}
                  alt="Hero preview"
                  className="w-full max-h-48 object-cover rounded"
                />
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updating}
            className="btn w-full"
          >
            {updating ? 'Updating...' : 'Update Hero Section'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroManager;
