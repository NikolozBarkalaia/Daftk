import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { getSettings, updateSettings } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';

const SettingsManager = () => {
  const { setSettings: setGlobalSettings } = useSettings();
  const [formData, setFormData] = useState({
    home_featured_title: '',
    shop_collection_title: '',
    contact_page_title: '',
    shipping_fee: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await getSettings();
      setFormData({
        home_featured_title: data.home_featured_title || 'Featured Pieces',
        shop_collection_title: data.shop_collection_title || 'Collection',
        contact_page_title: data.contact_page_title || 'Contact Us',
        shipping_fee: data.shipping_fee || '5.00',
      });
    } catch (err) {
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateSettings(formData);
      setGlobalSettings(data);
      showSuccess('Settings updated successfully');
    } catch (err) {
      showError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Site Text Settings</h1>
        <button
          onClick={fetchSettings}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Home Page: Featured Pieces Title
          </label>
          <input
            type="text"
            name="home_featured_title"
            value={formData.home_featured_title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition-colors"
            placeholder="e.g. Featured Pieces"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Page: Collection Title
          </label>
          <input
            type="text"
            name="shop_collection_title"
            value={formData.shop_collection_title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition-colors"
            placeholder="e.g. Collection"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Page: Title
          </label>
          <input
            type="text"
            name="contact_page_title"
            value={formData.contact_page_title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition-colors"
            placeholder="e.g. Contact Us"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Global Shipping Fee (₾)
          </label>
          <input
            type="number"
            step="0.01"
            name="shipping_fee"
            value={formData.shipping_fee}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition-colors"
            placeholder="e.g. 5.00"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 px-6 hover:bg-gray-900 transition-colors disabled:bg-gray-400"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;
