import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/contact', formData);
      showSuccess('Your inquiry has been sent successfully. Our team will contact you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      showError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '60px 20px' }}>
      <h1 className="page-title">{settings.contact_page_title}</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--color-gray-dark)' }}>
        For inquiries, please reach out to our concierge team.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field" 
            placeholder="Your Name" 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field" 
            placeholder="Your Email" 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="input-field" 
            rows="5" 
            placeholder="Your Message"
            required
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn"
        >
          {loading ? 'Sending...' : 'Send Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
