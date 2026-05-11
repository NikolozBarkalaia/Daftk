import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, confirm } = useNotification();

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });

    if (isConfirmed) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter(p => p._id !== id));
        showSuccess('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        showError('Failed to delete post');
      }
    }
  };

  if (loading) return <div>Loading posts...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Posts</h1>
        <Link
          to="/admin/posts/new"
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-dark transition-colors"
        >
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-light text-gray-dark text-sm uppercase tracking-wider">
              <th className="p-4 font-medium border-b border-border">Title</th>
              <th className="p-4 font-medium border-b border-border">Date</th>
              <th className="p-4 font-medium border-b border-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-dark">No posts found. Create one!</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-border font-medium">{post.title}</td>
                  <td className="p-4 border-b border-border text-gray-dark">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 border-b border-border text-right space-x-3">
                    <Link to={`/admin/posts/${post._id}`} className="inline-block text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostsList;
