import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const fetchPost = async () => {
        try {
          const { data } = await api.get(`/posts/${id}`);
          setTitle(data.title);
          setContent(data.content);
          setImage(data.image || '');
          setTags(data.tags?.join(', ') || '');
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const postData = {
      title,
      content,
      image,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      if (isNew) {
        await api.post('/posts', postData);
      } else {
        await api.put(`/posts/${id}`, postData);
      }
      showSuccess('Post saved successfully');
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      showError('Error saving post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-serif font-bold mb-8">
        {isNew ? 'Create New Post' : 'Edit Post'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 border border-border rounded focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="8"
            className="w-full p-3 border border-border rounded focus:outline-none focus:border-black transition-colors resize-y"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-3 border border-border rounded focus:outline-none focus:border-black transition-colors"
            placeholder="/uploads/example.jpg"
          />
          <p className="text-xs text-gray-dark mt-1">You can upload media in the Media tab and paste the URL here.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border border-border rounded focus:outline-none focus:border-black transition-colors"
            placeholder="fashion, news, collection"
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="bg-white text-black border border-border px-6 py-2 rounded hover:bg-gray-light transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEdit;
