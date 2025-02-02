import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { X, SendHorizontal, ChevronDown, Search } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { spbDistricts } from '../../data/districts';
import { specializations } from '../../data/specializations';
import { carBrandsByRegion } from '../../data/carBrands';
import { truckBrandsByRegion } from '../../data/truckBrands';
import { locksmithServices } from '../../data/locksmithServices';
import { roadsideServices } from '../../data/roadsideServices';

interface CreateRequestPageProps {
  onClose: () => void;
}

type VehicleType = 'passenger' | 'truck' | 'locksmith' | 'roadside' | 'special' | 'moto' | null;

export function CreateRequestPage({ onClose }: CreateRequestPageProps) {
  const { user } = useTelegramWebApp();
  const [isDistrictsOpen, setIsDistrictsOpen] = useState(false);
  const [isSpecializationsOpen, setIsSpecializationsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const districtsRef = useRef<HTMLDivElement>(null);
  const specializationsRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const [searchQueries, setSearchQueries] = useState({
    districts: '',
    specializations: '',
    options: ''
  });

  const [formData, setFormData] = useState({
    client_phone: '+7',
    client_address: '',
    vehicle_year: '',
    amount: '',
    commission: '',
    comment: '',
    district: '',
    specialization: '',
    vehicle_type: null as VehicleType,
    selected_option: ''
  });

  useClickOutside(districtsRef, () => setIsDistrictsOpen(false));
  useClickOutside(specializationsRef, () => setIsSpecializationsOpen(false));
  useClickOutside(optionsRef, () => setIsOptionsOpen(false));

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '+7';
    if (numbers.length > 11) return formData.client_phone;
    if (numbers.length <= 1) return '+7';
    return `+7${numbers.substring(1)}`;
  };

  const getOptionsForVehicleType = () => {
    switch (formData.vehicle_type) {
      case 'passenger':
        return Object.values(carBrandsByRegion).flat();
      case 'truck':
        return Object.values(truckBrandsByRegion).flat();
      case 'locksmith':
        return locksmithServices;
      case 'roadside':
        return roadsideServices;
      default:
        return [];
    }
  };

  const notifyWebhook = async (orderData: any) => {
    try {
      const webhookData = {
        ...orderData,
        telegram_id: user?.id,
        username: user?.username,
        first_name: user?.first_name
      };

      await fetch('https://gorskybase.store/webhook/609f8b60-c087-4045-afcb-c10ebf928426', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.client_phone || !formData.client_address || !formData.amount || !formData.commission) {
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }

      // Validate phone number format (exactly 11 digits)
      const phoneDigits = formData.client_phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        throw new Error('Номер телефона должен содержать 11 цифр');
      }

      // Validate year
      const year = parseInt(formData.vehicle_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        throw new Error(`Год выпуска должен быть между 1900 и ${currentYear}`);
      }

      // Validate amount and commission
      const amount = parseFloat(formData.amount);
      const commission = parseFloat(formData.commission);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Неверная сумма заказа');
      }
      if (isNaN(commission) || commission <= 0 || commission >= amount) {
        throw new Error('Неверная комиссия');
      }

      // Validate district selection
      if (!formData.district) {
        throw new Error('Выберите район');
      }

      // Validate selections
      if (!formData.specialization) {
        throw new Error('Выберите специализацию');
      }
      if (!formData.vehicle_type) {
        throw new Error('Выберите тип транспорта');
      }
      if (['passenger', 'truck', 'locksmith', 'roadside'].includes(formData.vehicle_type) && !formData.selected_option) {
        throw new Error('Выберите марку или тип работ');
      }

      // Prepare data based on vehicle type
      const orderData: any = {
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        vehicle_year: year,
        amount,
        commission,
        comment: formData.comment,
        created_by: user.id,
        districts: [formData.district],
        specialization: [formData.specialization]
      };

      // Add specific fields based on vehicle type
      switch (formData.vehicle_type) {
        case 'passenger':
          orderData.passenger_car_brands = [formData.selected_option];
          break;
        case 'truck':
          orderData.truck_brands = [formData.selected_option];
          break;
        case 'locksmith':
          orderData.locksmith_services = [formData.selected_option];
          break;
        case 'roadside':
          orderData.roadside_services = [formData.selected_option];
          break;
        case 'special':
          orderData.special_vehicles = true;
          break;
        case 'moto':
          orderData.motorcycles = true;
          break;
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert(orderData);

      if (insertError) throw insertError;

      // Send webhook notification
      await notifyWebhook(orderData);

      // Show success message
      const webApp = window.Telegram?.WebApp;
      if (webApp?.showPopup) {
        webApp.showPopup({
          title: 'Успешно',
          message: 'Заявка успешно создана',
          buttons: [{ type: 'close' }]
        });
      }

      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при создании заявки');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchInput = (
    placeholder: string,
    searchKey: keyof typeof searchQueries
  ) => (
    <div className="px-4 py-2 border-b border-[#3D3D3D]">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQueries[searchKey]}
          onChange={(e) => setSearchQueries(prev => ({
            ...prev,
            [searchKey]: e.target.value
          }))}
          className="w-full bg-[#1F1F1F] rounded-lg pl-8 pr-4 py-1.5 text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-[#1F1F1F] mx-2 sm:mx-4 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Создать заявку</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Телефон клиента
          </label>
          <input
            type="tel"
            value={formData.client_phone}
            onChange={e => setFormData(prev => ({
              ...prev,
              client_phone: formatPhoneNumber(e.target.value)
            }))}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
            placeholder="+7"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Адрес клиента
          </label>
          <input
            type="text"
            value={formData.client_address}
            onChange={e => setFormData(prev => ({
              ...prev,
              client_address: e.target.value
            }))}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
            placeholder="Введите адрес"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Год выпуска транспорта
          </label>
          <input
            type="number"
            value={formData.vehicle_year}
            onChange={e => setFormData(prev => ({
              ...prev,
              vehicle_year: e.target.value
            }))}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
            placeholder="Введите год выпуска"
          />
        </div>

        <div ref={districtsRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Район работы
          </label>
          <button
            type="button"
            onClick={() => setIsDistrictsOpen(!isDistrictsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.district || 'Выберите район'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isDistrictsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isDistrictsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск районов...', 'districts')}
              {spbDistricts
                .filter(district => 
                  district.toLowerCase().includes(searchQueries.districts.toLowerCase())
                )
                .map(district => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        district: district
                      }));
                      setIsDistrictsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-[#3D3D3D] ${
                      formData.district === district ? 'bg-[#3D3D3D]' : ''
                    }`}
                  >
                    <span className="text-sm">{district}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div ref={specializationsRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Специализация
          </label>
          <button
            type="button"
            onClick={() => setIsSpecializationsOpen(!isSpecializationsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.specialization || 'Выберите специализацию'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isSpecializationsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isSpecializationsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск специализаций...', 'specializations')}
              {specializations
                .filter(spec => 
                  spec.toLowerCase().includes(searchQueries.specializations.toLowerCase())
                )
                .map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specialization: spec
                      }));
                      setIsSpecializationsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#3D3D3D]"
                  >
                    <span className="text-sm">{spec}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Тип транспорта/работ
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'passenger', label: 'Легковое авто' },
              { type: 'truck', label: 'Грузовое авто' },
              { type: 'locksmith', label: 'Слесарные работы' },
              { type: 'roadside', label: 'Тех. помощь' },
              { type: 'special', label: 'Спецтранспорт' },
              { type: 'moto', label: 'Мототехника' }
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    vehicle_type: type as VehicleType,
                    selected_option: ''
                  }));
                }}
                className={`p-3 rounded-lg text-center transition-colors ${
                  formData.vehicle_type === type
                    ? 'bg-[#6B6BF9] text-white'
                    : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#3D3D3D]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {['passenger', 'truck', 'locksmith', 'roadside'].includes(formData.vehicle_type || '') && (
          <div ref={optionsRef} className="relative">
            <label className="block text-sm text-gray-400 mb-1">
              {formData.vehicle_type === 'passenger' ? 'Марка легкового авто' :
               formData.vehicle_type === 'truck' ? 'Марка грузового авто' :
               formData.vehicle_type === 'locksmith' ? 'Вид работ' :
               'Вид техпомощи'}
            </label>
            <button
              type="button"
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
            >
              <span className="truncate">
                {formData.selected_option || 'Выберите из списка'}
              </span>
              <ChevronDown
                className={`ml-2 transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`}
                size={20}
              />
            </button>

            {isOptionsOpen && (
              <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
                {renderSearchInput('Поиск...', 'options')}
                {getOptionsForVehicleType()
                  .filter(option => 
                    option.toLowerCase().includes(searchQueries.options.toLowerCase())
                  )
                  .map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selected_option: option
                        }));
                        setIsOptionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#3D3D3D]"
                    >
                      <span className="text-sm">{option}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Сумма заказа
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={e => setFormData(prev => ({
              ...prev,
              amount: e.target.value
            }))}
            min="0"
            step="100"
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Комиссия исполнителю
          </label>
          <input
            type="number"
            value={formData.commission}
            onChange={e => setFormData(prev => ({
              ...prev,
              commission: e.target.value
            }))}
            min="0"
            step="100"
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Комментарий по заказу
          </label>
          <textarea
            value={formData.comment}
            onChange={e => setFormData(prev => ({
              ...prev,
              comment: e.target.value
            }))}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white resize-none"
            rows={3}
            placeholder="Введите комментарий"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6B6BF9]/20 hover:bg-[#6B6BF9]/30 text-[#6B6BF9] py-3 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50"
        >
          <SendHorizontal className="w-5 h-5" />
          {isLoading ? 'Создание...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  );
}