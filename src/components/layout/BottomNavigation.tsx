import React from 'react';
import { User, ClipboardList } from 'lucide-react';

interface BottomNavigationProps {
  activeNavItem: string;
  setActiveNavItem: (item: string) => void;
}

export function BottomNavigation({ activeNavItem, setActiveNavItem }: BottomNavigationProps) {
  return (
    <div className="mt-auto mb-6">
      <div className="relative bg-[#1F1F1F] p-2 mx-2 sm:mx-4 rounded-2xl flex justify-between">
        <div 
          className="absolute h-full top-0 bg-[#2D2D2D] rounded-xl transition-all duration-300 ease-out"
          style={{
            width: '50%',
            left: activeNavItem === 'cabinet' ? '0%' : '50%'
          }}
        />
        
        <button 
          onClick={() => setActiveNavItem('cabinet')}
          className={`flex items-center justify-center gap-2 w-1/2 py-2 z-10 transition-colors relative ${
            activeNavItem === 'cabinet' ? 'text-[#6B6BF9]' : 'text-gray-400'
          }`}
        >
          <User size={18} className="sm:size-20" />
          <span className="text-xs sm:text-sm">Профиль</span>
        </button>
        <button 
          onClick={() => setActiveNavItem('requests')}
          className={`flex items-center justify-center gap-2 w-1/2 py-2 z-10 transition-colors relative ${
            activeNavItem === 'requests' ? 'text-[#6B6BF9]' : 'text-gray-400'
          }`}
        >
          <ClipboardList size={18} className="sm:size-20" />
          <span className="text-xs sm:text-sm">Заявки</span>
        </button>
      </div>
    </div>
  );
}