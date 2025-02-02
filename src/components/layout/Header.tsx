import React, { useEffect, useState } from 'react';
import { User, Menu } from 'lucide-react';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface HeaderProps {
  onFaqClick: () => void;
  onSupportClick: () => void;
}

export function Header({ onFaqClick, onSupportClick }: HeaderProps) {
  const [userName, setUserName] = useState<string>('Пользователь');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useTelegramWebApp();

  useEffect(() => {
    if (user) {
      const firstName = user.first_name.split(' ')[0];
      setUserName(firstName);
      if (user.photo_url) {
        setUserPhoto(user.photo_url);
      }
    }
  }, [user]);

  return (
    <>
      <div className="bg-black">
        <div className="p-3 sm:p-4 rounded-2xl bg-[#6B6BF9] mx-2 sm:mx-4 mt-2 sm:mt-4 mb-4">
          <div className="flex items-center justify-between max-w-screen-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white flex items-center justify-center flex-shrink-0">
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt="Аватар" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-medium truncate text-white">Привет, {userName}!</h1>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Меню"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 px-2">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-[#1F1F1F] rounded-xl shadow-lg overflow-hidden min-w-[200px] mr-2">
            <div className="p-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onFaqClick();
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2D2D2D] rounded-lg transition-colors flex items-center gap-3"
              >
                <span>FAQ</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSupportClick();
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2D2D2D] rounded-lg transition-colors flex items-center gap-3"
              >
                <span>Поддержка</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2D2D2D] rounded-lg transition-colors flex items-center gap-3"
              >
                <span>Чаты</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}