import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#646cff] transition-all duration-50 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}