import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings } from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    home_featured_title: 'Featured Pieces',
    shop_collection_title: 'Collection',
    contact_page_title: 'Contact Us',
    shipping_fee: '5.00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch((err) => console.error('Failed to load settings', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
