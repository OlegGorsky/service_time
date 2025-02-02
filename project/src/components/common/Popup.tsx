import React, { useEffect } from 'react';

interface PopupProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Popup({ message, isVisible, onClose }: PopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="bg-[#2D2D2D] text-white px-6 py-4 rounded-xl shadow-lg relative z-10 max-w-md text-center">
        {message}
      </div>
    </div>
  );
}