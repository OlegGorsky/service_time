import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import { logger } from './lib/logger';
import { CabinetPage } from './components/cabinet/CabinetPage';
import { RequestsPage } from './components/requests/RequestsPage';
import { ProfilePage } from './components/menu/ProfilePage';
import { VerificationPage } from './components/menu/VerificationPage';
import { CreateRequestPage } from './components/menu/CreateRequestPage';
import { PaymentsPage } from './components/menu/PaymentsPage';
import { MyRequestsPage } from './components/menu/MyRequestsPage';
import { FaqPage } from './components/menu/FaqPage';
import { SupportPage } from './components/menu/SupportPage';
import { AdminVerification } from './pages/AdminVerification';
import { Popup } from './components/common/Popup';
import { SplashScreen } from './components/splash/SplashScreen';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import { supabase } from './lib/supabase';
import { Shield, FileText, CreditCard } from 'lucide-react';

function App() {
  const { user, isInitialized } = useTelegramWebApp();
  useTelegramTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeNavItem, setActiveNavItem] = useState('cabinet');
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [activeRequestTab, setActiveRequestTab] = useState('available');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showVerificationPage, setShowVerificationPage] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isAdminVerification, setIsAdminVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const slides = [
    {
      icon: <Shield className="text-[#FF6B6B]" />,
      title: "Верификация",
      subtitle: "Пройдите верификацию, чтобы получить доступ ко всем функциям"
    },
    {
      icon: <FileText className="text-[#4ECDC4]" />,
      title: "Заявки",
      subtitle: "Принимайте заявки и зарабатывайте"
    },
    {
      icon: <CreditCard className="text-[#FFD93D]" />,
      title: "Оплата",
      subtitle: "Удобные способы получения оплаты"
    }
  ];

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) return;

      try {
        logger.info('Checking user status', { userId: user.id });
        setIsCheckingProfile(true);
        const { data, error } = await supabase
          .from('users')
          .select('phone, districts, specialization, is_verified')
          .eq('telegram_id', user.id)
          .single();

        if (error) {
          logger.error('Error fetching user data:', error);
          throw error;
        }

        const isComplete = Boolean(
          data?.phone && 
          data?.districts?.length && 
          data?.specialization?.length
        );

        setIsProfileComplete(isComplete);
        setIsVerified(Boolean(data?.is_verified));
      } catch (error) {
        logger.error('Error checking user status:', error);
        setIsProfileComplete(false);
        setIsVerified(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (user?.id) {
      checkUserStatus();
    }
  }, [user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6B6BF9] mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (isAdminVerification) {
    return <AdminVerification />;
  }

  if (isCheckingProfile) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onComplete={(isAdmin) => {
      setIsAdminVerification(isAdmin);
      setShowSplash(false);
    }} />;
  }

  const handleNavChange = (item: string) => {
    setSlideDirection(item === 'requests' ? 'right' : 'left');
    setActiveNavItem(item);
    setActiveMenuItem(null);
  };

  const handleMenuItemClick = async (item: string) => {
    if (item === 'verification') {
      if (isCheckingProfile) return;
      
      if (isProfileComplete === false) {
        setShowVerificationPopup(true);
      } else {
        setShowVerificationPage(true);
      }
    } else {
      setActiveMenuItem(item);
    }
  };

  const handleCloseMenuItem = () => {
    setActiveMenuItem(null);
  };

  const renderMenuContent = () => {
    switch (activeMenuItem) {
      case 'profile':
        return <ProfilePage onClose={handleCloseMenuItem} />;
      case 'create':
        return <CreateRequestPage onClose={handleCloseMenuItem} />;
      case 'payment':
        return <PaymentsPage onClose={handleCloseMenuItem} />;
      case 'requests':
        return <MyRequestsPage />;
      case 'faq':
        return <FaqPage onClose={handleCloseMenuItem} />;
      case 'support':
        return <SupportPage onClose={handleCloseMenuItem} />;
      default:
        return (
          <CabinetPage
            currentSlide={currentSlide}
            slides={slides}
            activeMenuItem={activeMenuItem}
            setActiveMenuItem={handleMenuItemClick}
            onPrevSlide={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
            onNextSlide={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
            onGoToSlide={setCurrentSlide}
            isVerified={isVerified}
            isProfileComplete={isProfileComplete}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col">
      <Header 
        onFaqClick={() => setActiveMenuItem('faq')}
        onSupportClick={() => setActiveMenuItem('support')}
      />
      <div className="flex-1 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ 
            transform: `translateX(${activeNavItem === 'cabinet' ? '0%' : '-100%'})`,
          }}
        >
          <div className="w-full flex-shrink-0">
            {renderMenuContent()}
          </div>
          <div className="w-full flex-shrink-0">
            <RequestsPage
              activeRequestTab={activeRequestTab}
              setActiveRequestTab={setActiveRequestTab}
            />
          </div>
        </div>
      </div>
      <BottomNavigation
        activeNavItem={activeNavItem}
        setActiveNavItem={handleNavChange}
      />
      {!isCheckingProfile && (
        <>
          <Popup
            message="Прежде чем пройти верификацию, сначала расскажите о себе на вкладке «Мои данные»"
            isVisible={showVerificationPopup}
            onClose={() => setShowVerificationPopup(false)}
          />
          {showVerificationPage && (
            <VerificationPage onClose={() => setShowVerificationPage(false)} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
