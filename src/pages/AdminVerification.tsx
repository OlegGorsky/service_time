import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface VerificationRequest {
  id: string;
  telegram_id: string;
  username: string | null;
  first_name: string;
  photo_url: string | null;
  verification_photo: string | null;
  verification_requested_at: string | null;
  verification_status: string;
  phone: string;
  districts: string[];
  specialization: string[];
  passenger_car_brands: string[];
  truck_brands: string[];
  locksmith_services: string[];
  roadside_services: string[];
  special_vehicles: boolean;
  motorcycles: boolean;
}

interface StartappData {
  action?: string;
  telegram_id?: string;
  userId?: string;
}

export function AdminVerification() {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVerificationData = async () => {
      let startappParam = '';
      const webApp = window.Telegram?.WebApp;

      // First check start_param from Telegram WebApp
      if (webApp?.initDataUnsafe?.start_param) {
        startappParam = webApp.initDataUnsafe.start_param;
      }
      // Then check URL parameters
      else {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('startapp')) {
          startappParam = urlParams.get('startapp') || '';
        }
        // Finally check WebApp initData if other methods failed
        else if (webApp) {
          const webAppParams = new URLSearchParams(webApp.initData);
          startappParam = webAppParams.get('startapp') || '';
        }
      }

      if (!startappParam) {
        console.error('No startapp parameter found');
        setError('Отсутствует параметр startapp');
        return;
      }

      try {
        console.log('Encoded startapp:', startappParam);
        
        // Decode JSON from base64
        const jsonString = atob(startappParam);
        console.log('Decoded JSON:', jsonString);
        
        const data = JSON.parse(jsonString) as StartappData;
        console.log('Parsed data:', data);

        // Get telegram_id from either new or old format
        const telegramId = data.telegram_id || data.userId;
        console.log('Telegram ID:', telegramId);
        console.log('Action:', data.action);

        // Check if we have a valid telegram_id and it's a verification request
        if (!telegramId || (data.action && data.action !== 'verify')) {
          console.error('Invalid data format:', { telegramId, action: data.action });
          throw new Error('Invalid verification data format');
        }

        // Load user data
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();

        if (fetchError) {
          console.error('Error fetching user data:', fetchError);
          throw fetchError;
        }

        if (!userData) {
          setError('Пользователь не найден');
          return;
        }

        // Check verification status
        if (userData.verification_status === 'verified') {
          setError('Пользователь уже верифицирован');
          return;
        }

        if (userData.verification_status === 'rejected') {
          setError('Верификация этого пользователя была отклонена');
          return;
        }

        if (userData.verification_status !== 'pending') {
          setError('Нет активной заявки на верификацию');
          return;
        }

        console.log('Successfully loaded user data:', userData);
        setRequest(userData as VerificationRequest);
      } catch (error) {
        console.error('Error processing verification data:', error);
        setError('Ошибка при обработке данных верификации');
      }
    };

    loadVerificationData();
  }, []);

  const handleVerification = async (approved: boolean) => {
    if (!request) return;

    try {
      setIsProcessing(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_verified: approved,
          verification_status: approved ? 'verified' : 'rejected',
          verification_processed_at: new Date().toISOString()
        })
        .eq('telegram_id', request.telegram_id)
        .eq('verification_status', 'pending');

      if (updateError) {
        console.error('Error updating verification status:', updateError);
        throw updateError;
      }

      // Show success message
      const message = approved 
        ? 'Верификация успешно подтверждена' 
        : 'Верификация отклонена';
      
      // Use Telegram WebApp for popup message
      const webApp = window.Telegram?.WebApp;
      if (webApp?.showPopup) {
        webApp.showPopup({
          title: 'Готово',
          message: message,
          buttons: [{ type: 'close' }]
        });
      } else {
        alert(message);
      }
      
      // Close WebApp
      if (webApp?.close) {
        webApp.close();
      }
    } catch (error) {
      console.error('Error processing verification:', error);
      setError('Ошибка при обработке верификации');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h2 className="text-lg font-medium text-red-400 mb-2">Ошибка</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6B6BF9]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-medium mb-4">Верификация пользователя</h1>
        
        <div className="bg-[#1F1F1F] rounded-xl p-4 mb-4">
          {/* User Profile */}
          <div className="flex items-center gap-4 mb-6">
            {request.photo_url && (
              <img
                src={request.photo_url}
                alt="Фото профиля"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="font-medium">{request.first_name}</h2>
              {request.username && (
                <p className="text-gray-400">@{request.username}</p>
              )}
              <p className="text-sm text-gray-400">ID: {request.telegram_id}</p>
            </div>
          </div>

          {/* User Data */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Телефон</h3>
              <p>{request.phone || 'Не указан'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Районы работы</h3>
              <p>{request.districts?.length > 0 ? request.districts.join(', ') : 'Не указаны'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Специализация</h3>
              <p>{request.specialization?.length > 0 ? request.specialization.join(', ') : 'Не указана'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Марки легковых авто</h3>
              <p>{request.passenger_car_brands?.length > 0 ? request.passenger_car_brands.join(', ') : 'Не указаны'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Марки грузовых авто</h3>
              <p>{request.truck_brands?.length > 0 ? request.truck_brands.join(', ') : 'Не указаны'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Слесарные работы</h3>
              <p>{request.locksmith_services?.length > 0 ? request.locksmith_services.join(', ') : 'Не указаны'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Виды техпомощи</h3>
              <p>{request.roadside_services?.length > 0 ? request.roadside_services.join(', ') : 'Не указаны'}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1">Дополнительные категории</h3>
              <ul className="list-disc list-inside">
                {request.special_vehicles && <li>Спецтранспорт</li>}
                {request.motorcycles && <li>Мототехника</li>}
              </ul>
            </div>
          </div>

          {/* Verification Photo */}
          {request.verification_photo ? (
            <div className="aspect-[3/4] mb-4">
              <img
                src={request.verification_photo}
                alt="Фото для верификации"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
              Фото для верификации не загружено
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleVerification(false)}
              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg disabled:opacity-50 transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? 'Обработка...' : 'Отклонить'}
            </button>
            <button
              onClick={() => handleVerification(true)}
              className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg disabled:opacity-50 transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? 'Обработка...' : 'Подтвердить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}