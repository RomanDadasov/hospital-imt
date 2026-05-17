const Modal = ({ isOpen, onClose, title, children, description }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-50">
          <div>
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-transform active:scale-95 shrink-0 ml-4"
            aria-label="Close modal"
          >
         
            <img 
              src="/src/assets/icons/close-svgrepo-com (1).svg" 
              alt="Close" 
              width="13" 
              height="13"
              className="w-3 h-3"
            />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;