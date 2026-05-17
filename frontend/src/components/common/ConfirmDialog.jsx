import { useTranslation } from "react-i18next";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 animate-slide-up">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-rose-500">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-slate-700 text-sm text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-100"
          >
            {t("delete")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-50 hover:bg-gray-100 active:scale-95 text-slate-500 py-2.5 rounded-xl text-sm font-semibold transition-all border border-gray-100"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;