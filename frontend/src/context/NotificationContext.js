import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((msg) => showNotification(msg, 'success'), [showNotification]);
  const showError = useCallback((msg) => showNotification(msg, 'error'), [showNotification]);
  const showWarning = useCallback((msg) => showNotification(msg, 'warning'), [showNotification]);
  const showInfo = useCallback((msg) => showNotification(msg, 'info'), [showNotification]);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmModal({
        ...options,
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        }
      });
    });
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo, confirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded shadow-lg border-l-4 min-w-[300px] animate-slide-in
              ${toast.type === 'success' ? 'bg-white border-green-500 text-gray-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-500 text-gray-800' : ''}
              ${toast.type === 'warning' ? 'bg-white border-yellow-500 text-gray-800' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-500 text-gray-800' : ''}
            `}
          >
            <div className={`
              ${toast.type === 'success' ? 'text-green-500' : ''}
              ${toast.type === 'error' ? 'text-red-500' : ''}
              ${toast.type === 'warning' ? 'text-yellow-500' : ''}
              ${toast.type === 'info' ? 'text-blue-500' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 max-w-md w-full rounded shadow-2xl border border-border animate-scale-up">
            <h3 className="text-xl font-serif mb-4">{confirmModal.title || 'Confirm Action'}</h3>
            <p className="text-gray-dark mb-8">{confirmModal.message}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={confirmModal.onCancel}
                className="btn-outline px-6 py-2 text-sm"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn px-6 py-2 text-sm !border-none"
                style={{ backgroundColor: confirmModal.danger ? '#c0392b' : 'var(--color-black)' }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
