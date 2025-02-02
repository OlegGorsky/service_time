import React, { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { AnimatedCar } from './AnimatedCar';

interface SplashScreenProps {
  onComplete: (isAdminVerification: boolean) => void;
}

interface VerificationData {
  action?: string;
  telegram_id?: string;
  userId?: string;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check for verification token in URL or WebApp initData
    const checkVerificationToken = () => {
      try {
        let startapp = '';
        const webApp = window.Telegram?.WebApp;
        
        // First check start_param from Telegram WebApp
        if (webApp?.initDataUnsafe?.start_param) {
          startapp = webApp.initDataUnsafe.start_param;
        }
        // Then check URL parameters (for direct links)
        else {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('startapp')) {
            startapp = urlParams.get('startapp') || '';
          }
          // Finally check WebApp initData if other methods failed
          else if (webApp) {
            const webAppParams = new URLSearchParams(webApp.initData);
            startapp = webAppParams.get('startapp') || '';
          }
        }

        if (!startapp) return false;

        console.log('Found startapp parameter:', startapp);
        
        // Try to decode and parse the JSON
        const jsonString = atob(startapp);
        console.log('Decoded JSON:', jsonString);
        
        const data = JSON.parse(jsonString) as VerificationData;
        console.log('Parsed data:', data);

        // Check if it's a verification request
        // Support both new format (action: "verify") and old format (userId)
        const isVerification = Boolean(
          (data.action === 'verify' && (data.telegram_id || data.userId)) || 
          (!data.action && data.userId)
        );

        console.log('Is verification request:', isVerification);
        return isVerification;
      } catch (error) {
        console.error('Error checking verification token:', error);
        return false;
      }
    };

    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        clearInterval(timer);
        currentProgress = 100;
        // Check for verification token before completing
        const isAdminVerification = checkVerificationToken();
        setTimeout(() => onComplete(isAdminVerification), 200);
      }
      setProgress(currentProgress);
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0F0F0F] flex flex-col items-center justify-center p-4 z-50">
      <h1 className="text-4xl font-bold text-[#646cff] mb-2">ServiceTime</h1>
      <p className="text-gray-400 mb-12">Сервис для автомобильных мастеров</p>
      
      <div className="relative w-full max-w-md mb-8 overflow-hidden">
        <AnimatedCar progress={progress} />
        <ProgressBar progress={progress} />
      </div>
      
      <p className="text-xs text-gray-500">Made by Gorsky Team</p>
    </div>
  );
}