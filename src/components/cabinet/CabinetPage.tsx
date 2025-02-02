import React from 'react';
import { WelcomeSlider } from './WelcomeSlider';
import { MenuGrid } from './MenuGrid';

interface CabinetPageProps {
  currentSlide: number;
  slides: Array<{ title: string; subtitle: string; icon: React.ReactNode }>;
  activeMenuItem: string | null;
  setActiveMenuItem: (item: string | null) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  isVerified: boolean;
  isProfileComplete?: boolean;
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
    <>
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
    </>
  );
}