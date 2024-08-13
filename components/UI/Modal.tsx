'use client';

import React, { ReactNode, useEffect } from 'react';
import { CloseIcon } from '../Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 backdrop-blur backdrop-opacity-100 bg-white/60  flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 border border-black w-[94%] md:w-2/4 h-[90%] md:h-auto overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4" onClick={onClose}>
          <CloseIcon width={16} strokeWidth={1} height={16} fill="#000" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
