import React from 'react';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MenuItem({ icon, title, bgColor, isActive, onClick, className = '' }: MenuItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`${bgColor} p-3 rounded-2xl flex flex-col items-center gap-2 transition-transform hover:scale-95 active:scale-90 ${
        isActive ? 'ring-2 ring-[#6B6BF9]' : ''
      } ${className}`}
    >
      <div className={`text-2xl ${isActive ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className={`text-xs text-center ${isActive ? 'text-[#6B6BF9]' : 'text-gray-300'}`}>
        {title}
      </span>
    </button>
  );
}