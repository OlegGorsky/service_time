import React from 'react';
import { WelcomeSlider } from './WelcomeSlider';
import { MenuGrid } from './MenuGrid';

interface CabinetPageProps {
  currentSlide: number;
  slides: Array<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }>;
  activeMenuItem: string | null;
  setActiveMenuItem: (item: string | null) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  isVerified: boolean;
  isProfileComplete: boolean | undefined;
}

export function CabinetPage({
  currentSlide,
  slides,
  activeMenuItem,
  setActiveMenuItem,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  isVerified,
  isProfileComplete
}: CabinetPageProps) {
  return (
    <div className="flex flex-col h-full">
      <WelcomeSlider
        currentSlide={currentSlide}
        slides={slides}
        onPrevSlide={onPrevSlide}
        onNextSlide={onNextSlide}
        onGoToSlide={onGoToSlide}
      />
      <MenuGrid
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        isVerified={isVerified}
        isProfileComplete={isProfileComplete}
      />
    </div>
  );
}
