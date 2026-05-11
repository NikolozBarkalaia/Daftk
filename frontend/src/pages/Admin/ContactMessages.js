import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Mail, RefreshCw, User, Calendar, MessageSquare } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact');
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <div className="text-center py-10">Loading messages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Inquiries</h1>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-gray-light transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-border">
            <Mail size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-dark">No inquiries received yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-light pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-light rounded-full">
                    <User size={20} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{msg.name}</h3>
                    <p className="text-sm text-gray-dark">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-dark">
                  <Calendar size={16} />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <MessageSquare size={20} className="text-gray-200 shrink-0 mt-1" />
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
