import React from 'react';

export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  disabled?: boolean;
  completed?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

export function MenuItem({ 
  icon, 
  label, 
  color, 
  disabled, 
  completed, 
  isActive, 
  onClick 
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#2D2D2D]'}
        ${isActive ? 'bg-[#2D2D2D]' : 'bg-[#1F1F1F]'}
      `}
    >
      <div
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg mb-2
          ${completed ? 'bg-emerald-500/20 text-emerald-400' : `bg-[${color}]/20 text-[${color}]`}
        `}
      >
        {icon}
      </div>
      <span className="text-xs text-center text-gray-400">{label}</span>
      {completed && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
      )}
    </button>
  );
}
