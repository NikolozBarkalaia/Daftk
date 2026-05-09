import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, Image as ImageIcon, ShoppingBag, Film } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    media: 0,
    products: 0,
    sliderItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, mediaRes, productsRes, sliderRes] = await Promise.all([
          api.get('/posts?limit=1'),
          api.get('/media?limit=1'),
          api.get('/products?limit=1'),
          api.get('/slider')
        ]);

        setStats({
          posts: postsRes.data.total || 0,
          media: mediaRes.data.total || 0,
          products: productsRes.data.total || 0,
          sliderItems: sliderRes.data.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: <ShoppingBag size={24} className="text-black" />,
      color: 'bg-blue-100'
    },
    {
      title: 'Slider Items',
      value: stats.sliderItems,
      icon: <Film size={24} className="text-black" />,
      color: 'bg-purple-100'
    },
    {
      title: 'Total Posts',
      value: stats.posts,
      icon: <FileText size={24} className="text-black" />,
      color: 'bg-green-100'
    },
    {
      title: 'Media Files',
      value: stats.media,
      icon: <ImageIcon size={24} className="text-black" />,
      color: 'bg-orange-100'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-6 rounded-lg border border-border shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 ${card.color} rounded-full`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-dark font-medium uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Placeholder */}
        <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-serif font-bold mb-4">Quick Actions</h2>
          <ul className="space-y-3 text-sm">
            <li>✓ Manage products and inventory</li>
            <li>✓ Customize hero section with media</li>
            <li>✓ Create and reorder slider items</li>
            <li>✓ Upload and manage media files</li>
            <li>✓ Manage blog posts and content</li>
          </ul>
        </div>

        {/* System Info */}
        <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-serif font-bold mb-4">System Info</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-dark">API Status</dt>
              <dd className="font-medium text-green-600">✓ Connected</dd>
            </div>
            <div>
              <dt className="text-gray-dark">Database</dt>
              <dd className="font-medium">MongoDB</dd>
            </div>
            <div>
              <dt className="text-gray-dark">Upload Folder</dt>
              <dd className="font-medium">/uploads</dd>
            </div>
            <div>
              <dt className="text-gray-dark">Authentication</dt>
              <dd className="font-medium">JWT</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
