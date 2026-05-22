import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import FileUploader from '../../components/Admin/FileUploader';

const SliderManager = () => {
  const [sliderItems, setSliderItems] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, confirm } = useNotification();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    mediaType: 'image',
    mediaId: ''
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sliderRes, mediaRes] = await Promise.all([
        api.get('/slider'),
        api.get('/media')
      ]);

      setSliderItems(sliderRes.data);
      setMedia(mediaRes.data.media || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error loading slider data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      mediaType: 'image',
      mediaId: ''
    });
    setEditingId(null);
    setShowForm(false);
    setShowUploader(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const { data } = await api.post('/media/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh media list
      const mediaRes = await api.get('/media');
      const newMedia = mediaRes.data.media || [];
      setMedia(newMedia);

      // Extract uploaded file info (backend returns it directly)
      const uploadedFile = data;
      
      if (uploadedFile) {
        setFormData(prev => ({ 
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
      if (!formData.title || !formData.mediaId) {
        showError('Please fill in all required fields');
        return;
      }

      if (editingId) {
        // Update
        const response = await api.put(`/slider/${editingId}`, formData);
        setSliderItems(sliderItems.map(item => item._id === editingId ? response.data : item));
        showSuccess('Slider item updated successfully!');
      } else {
        // Create
        const response = await api.post('/slider', formData);
        setSliderItems([...sliderItems, response.data]);
        showSuccess('Slider item created successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving slider item:', error);
      showError(error.response?.data?.message || 'Error saving slider item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      mediaType: item.mediaType,
      mediaId: item.mediaId._id
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Slider Item',
      message: 'Are you sure you want to delete this slider item?',
      confirmText: 'Delete',
      danger: true
    });

    if (isConfirmed) {
      try {
        await api.delete(`/slider/${id}`);
        setSliderItems(sliderItems.filter(item => item._id !== id));
        showSuccess('Slider item deleted successfully!');
      } catch (error) {
        console.error('Error deleting slider item:', error);
        showError('Error deleting slider item');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading slider data...</div>;

  const filteredMedia = media.filter(m => m.type === formData.mediaType);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Slider Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn flex items-center gap-2"
          >
            <Plus size={20} /> Add Slider Item
          </button>
        )}
      </div>


      {/* Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-lg border border-border shadow-sm mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">{editingId ? 'Edit' : 'Add'} Slider Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Media Type</label>
              <select
                name="mediaType"
                value={formData.mediaType}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Media Asset *
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
                    value={formData.mediaId}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">-- Choose a {formData.mediaType} --</option>
                    {filteredMedia.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.filename}
                      </option>
                    ))}
                  </select>
                  {filteredMedia.length === 0 && (
                    <p className="text-sm text-gray-dark mt-2">
                      No {formData.mediaType}s available. Click "Upload New" above.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn flex-1">
                {editingId ? 'Update Item' : 'Create Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {sliderItems.length === 0 ? (
          <p className="text-center text-gray-dark py-8">No slider items yet. Create one to get started!</p>
        ) : (
          sliderItems.map((item, index) => (
            <div key={item._id} className="bg-white p-6 rounded-lg border border-border shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-dark text-sm">#{index + 1}</span>
                    <h3 className="text-xl font-serif font-bold">{item.title}</h3>
                    {item.isFeatured && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Featured</span>}
                  </div>
                  {item.subtitle && <p className="text-gray-dark mb-1">{item.subtitle}</p>}
                  {item.description && <p className="text-gray-dark text-sm mb-3">{item.description}</p>}
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-dark">Type: {item.mediaType}</span>
                    <span className="text-gray-dark">Button: {item.buttonText}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-gray-light rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SliderManager;
