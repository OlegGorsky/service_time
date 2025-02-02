import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WelcomeSliderProps {
  currentSlide: number;
  slides: Array<{ title: string; subtitle: string; icon: React.ReactNode }>;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
}

export function WelcomeSlider({ 
  currentSlide, 
  slides, 
  onPrevSlide, 
  onNextSlide, 
  onGoToSlide 
}: WelcomeSliderProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchEndX.current - touchStartX.current;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      onNextSlide();
    } else if (isRightSwipe) {
      onPrevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative bg-[#1F1F1F] mx-2 sm:mx-4 p-4 sm:p-6 rounded-2xl mb-2 sm:mb-4">
      <button 
        onClick={onPrevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 hover:bg-[#2D2D2D] p-1.5 sm:p-2 rounded-full transition-colors z-10"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button 
        onClick={onNextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-[#2D2D2D] p-1.5 sm:p-2 rounded-full transition-colors z-10"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      
      <div 
        className="min-h-[120px] sm:min-h-[150px] overflow-hidden px-4 sm:px-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className="w-full flex-shrink-0 flex-grow-0"
              style={{ width: '100%' }}
            >
              <div className="text-center">
                <div className="inline-block mb-2 transform transition-transform">
                  {React.cloneElement(slide.icon as React.ReactElement, {
                    size: window.innerWidth < 640 ? 24 : 32
                  })}
                </div>
                <h2 className="text-lg sm:text-xl font-medium mb-1 sm:mb-2">{slide.title}</h2>
                <p className="text-xs sm:text-sm text-gray-400">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-[#6B6BF9] w-3 sm:w-4' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}