import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 20h20L12 2z" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5M12 16.5v.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2" />
      <path d="M12 11v5M12 8v.5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const styles = {
  success: "border-emerald-500/40 bg-emerald-950/95",
  error: "border-red-500/40 bg-red-950/95",
  warning: "border-amber-500/40 bg-amber-950/95",
  info: "border-blue-500/40 bg-blue-950/95",
};

const bars = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const Toast = ({ toast, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl w-80 overflow-hidden cursor-pointer ${styles[toast.type]}`}
      onClick={() => onRemove(toast.id)}
    >
      
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${bars[toast.type]}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
      />

      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-white text-sm font-semibold leading-tight">{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-white/70 text-xs mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const toast = {
    success: (title, message) => show({ type: "success", title, message }),
    error: (title, message) => show({ type: "error", title, message }),
    warning: (title, message) => show({ type: "warning", title, message }),
    info: (title, message) => show({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};