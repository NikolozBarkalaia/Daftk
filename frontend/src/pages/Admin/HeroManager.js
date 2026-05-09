import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Film } from 'lucide-react';

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
  const [message, setMessage] = useState('');

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

      setHero(heroRes.data);
      setMedia(mediaRes.data.media || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading hero data');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setMessage('');

      const response = await api.put('/hero', {
        title: hero.title,
        subtitle: hero.subtitle,
        buttonText: hero.buttonText,
        buttonLink: hero.buttonLink,
        mediaType: hero.mediaType,
        mediaId: hero.mediaId
      });

      setHero(response.data);
      setMessage('Hero section updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating hero:', error);
      setMessage(error.response?.data?.message || 'Error updating hero section');
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

      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

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
          <div>
            <label className="block text-sm font-medium mb-2">
              Select {hero.mediaType === 'video' ? 'Video' : 'Image'}
            </label>
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
                No {hero.mediaType}s available. Upload one in the Media section first.
              </p>
            )}
          </div>

          {/* Current Media Preview */}
          {hero.mediaId && (
            <div className="bg-gray-light p-4 rounded">
              <p className="text-sm text-gray-dark mb-3">Current {hero.mediaType}:</p>
              {hero.mediaType === 'video' ? (
                <video
                  src={`http://localhost:5000${media.find(m => m._id === hero.mediaId)?.url}`}
                  controls
                  className="w-full max-h-48 rounded"
                />
              ) : (
                <img
                  src={`http://localhost:5000${media.find(m => m._id === hero.mediaId)?.url}`}
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
