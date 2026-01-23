import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (message: string, type: AlertType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const newAlert: Alert = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  };

  const showSuccess = (message: string) => showAlert(message, 'success');
  const showError = (message: string) => showAlert(message, 'error');
  const showWarning = (message: string) => showAlert(message, 'warning');
  const showInfo = (message: string) => showAlert(message, 'info');

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'info':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`${getAlertStyles(alert.type)} text-white px-6 py-4 rounded-xl shadow-2xl border-2 pointer-events-auto`}
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{alert.message}</p>
                </div>
                <button
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-white/80 hover:text-white transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
};
