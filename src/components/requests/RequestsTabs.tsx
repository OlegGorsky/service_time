import React from 'react';

interface RequestsTabsProps {
  activeRequestTab: string;
  setActiveRequestTab: (tab: string) => void;
}

export function RequestsTabs({ activeRequestTab, setActiveRequestTab }: RequestsTabsProps) {
  return (
    <div className="px-2 sm:px-4 mb-2 sm:mb-4">
      <div className="relative bg-[#1F1F1F] p-1 rounded-lg flex justify-between">
        <div 
          className="absolute h-full top-0 bg-[#6B6BF9] rounded-lg transition-all duration-300 ease-out"
          style={{
            width: '33.333%',
            left: activeRequestTab === 'available' ? '0%' : 
                 activeRequestTab === 'my' ? '33.333%' : '66.666%'
          }}
        />
        
        <button 
          onClick={() => setActiveRequestTab('available')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-center z-10 transition-colors relative ${
            activeRequestTab === 'available' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Доступные
        </button>
        <button 
          onClick={() => setActiveRequestTab('my')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-center z-10 transition-colors relative ${
            activeRequestTab === 'my' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Мои
        </button>
        <button 
          onClick={() => setActiveRequestTab('inProgress')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center z-10 transition-colors relative ${
            activeRequestTab === 'inProgress' ? 'text-white' : 'text-gray-400'
          }`}
        >
          В работе
        </button>
      </div>
    </div>
  );
}