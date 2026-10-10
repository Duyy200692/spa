import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[88vh] sm:max-h-[92vh] flex flex-col sm:my-auto border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-3.5 sm:px-5 sm:py-4 border-b border-gray-100 shrink-0 gap-3">
          <h2 className="text-base sm:text-xl font-bold font-serif text-[#5C3A3A] line-clamp-1">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            title="Đóng (Close)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 pb-8 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
