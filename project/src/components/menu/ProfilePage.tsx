import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { spbDistricts } from '../../data/districts';
import { specializations } from '../../data/specializations';
import { carBrandsByRegion } from '../../data/carBrands';
import { truckBrandsByRegion } from '../../data/truckBrands';
import { locksmithServices } from '../../data/locksmithServices';
import { roadsideServices } from '../../data/roadsideServices';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { ChevronDown, X, Search, Asterisk } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ProfilePageProps {
  onClose: () => void;
}

interface UserProfile {
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

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {required && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#6B6BF9]/10 text-[#6B6BF9]">
          <Asterisk className="w-3 h-3 mr-1" />
          Обязательно
        </span>
      )}
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user } = useTelegramWebApp();
  const [isEditing, setIsEditing] = useState(true);
  const [isDistrictsOpen, setIsDistrictsOpen] = useState(false);
  const [isSpecializationsOpen, setIsSpecializationsOpen] = useState(false);
  const [isCarBrandsOpen, setIsCarBrandsOpen] = useState(false);
  const [isTruckBrandsOpen, setIsTruckBrandsOpen] = useState(false);
  const [isLocksmithServicesOpen, setIsLocksmithServicesOpen] = useState(false);
  const [isRoadsideServicesOpen, setIsRoadsideServicesOpen] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [expandedTruckRegions, setExpandedTruckRegions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState({
    districts: '',
    specializations: '',
    carBrands: '',
    truckBrands: '',
    locksmithServices: '',
    roadsideServices: ''
  });

  const districtsRef = useRef<HTMLDivElement>(null);
  const specializationsRef = useRef<HTMLDivElement>(null);
  const carBrandsRef = useRef<HTMLDivElement>(null);
  const truckBrandsRef = useRef<HTMLDivElement>(null);
  const locksmithServicesRef = useRef<HTMLDivElement>(null);
  const roadsideServicesRef = useRef<HTMLDivElement>(null);

  const closeAllDropdowns = () => {
    setIsDistrictsOpen(false);
    setIsSpecializationsOpen(false);
    setIsCarBrandsOpen(false);
    setIsTruckBrandsOpen(false);
    setIsLocksmithServicesOpen(false);
    setIsRoadsideServicesOpen(false);
  };

  useClickOutside(districtsRef, () => setIsDistrictsOpen(false));
  useClickOutside(specializationsRef, () => setIsSpecializationsOpen(false));
  useClickOutside(carBrandsRef, () => setIsCarBrandsOpen(false));
  useClickOutside(truckBrandsRef, () => setIsTruckBrandsOpen(false));
  useClickOutside(locksmithServicesRef, () => setIsLocksmithServicesOpen(false));
  useClickOutside(roadsideServicesRef, () => setIsRoadsideServicesOpen(false));

  useEffect(() => {
    return () => {
      closeAllDropdowns();
    };
  }, []);

  const [formData, setFormData] = useState<UserProfile>({
    phone: '+7',
    districts: [],
    specialization: [],
    passenger_car_brands: [],
    truck_brands: [],
    locksmith_services: [],
    roadside_services: [],
    special_vehicles: false,
    motorcycles: false
  });

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          phone: data.phone || '+7',
          districts: Array.isArray(data.districts) ? data.districts : [],
          specialization: Array.isArray(data.specialization) ? data.specialization : [],
          passenger_car_brands: Array.isArray(data.passenger_car_brands) ? data.passenger_car_brands : [],
          truck_brands: Array.isArray(data.truck_brands) ? data.truck_brands : [],
          locksmith_services: Array.isArray(data.locksmith_services) ? data.locksmith_services : [],
          roadside_services: Array.isArray(data.roadside_services) ? data.roadside_services : [],
          special_vehicles: Boolean(data.special_vehicles),
          motorcycles: Boolean(data.motorcycles)
        });
        
        const isComplete = Boolean(
          data.phone && 
          data.districts?.length > 0 && 
          data.specialization?.length > 0
        );
        setIsEditing(!isComplete);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!formData.phone || formData.districts.length === 0 || formData.specialization.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          phone: formData.phone,
          districts: formData.districts,
          specialization: formData.specialization,
          passenger_car_brands: formData.passenger_car_brands,
          truck_brands: formData.truck_brands,
          locksmith_services: formData.locksmith_services,
          roadside_services: formData.roadside_services,
          special_vehicles: formData.special_vehicles,
          motorcycles: formData.motorcycles,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', user.id);

      if (error) throw error;

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Ошибка при сохранении данных');
    }
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleTruckRegion = (region: string) => {
    setExpandedTruckRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const filterItems = (items: string[], searchQuery: string) => {
    return items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  if (!isEditing) {
    return (
      <div className="p-4 bg-[#1F1F1F] mx-2 sm:mx-4 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Мои данные</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#6B6BF9] rounded-lg text-sm"
            >
              Редактировать
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400">Телефон</h3>
            <p>{formData.phone}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-400">Районы работы</h3>
            <p>{formData.districts.join(', ') || 'Не выбраны'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-400">Специализация</h3>
            <p>{formData.specialization.join(', ') || 'Не указана'}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400">Марки легковых авто</h3>
            <p>{formData.passenger_car_brands.join(', ') || 'Не выбраны'}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400">Марки грузовых авто</h3>
            <p>{formData.truck_brands.join(', ') || 'Не выбраны'}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400">Слесарные работы</h3>
            <p>{formData.locksmith_services.join(', ') || 'Не выбраны'}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400">Виды техпомощи</h3>
            <p>{formData.roadside_services.join(', ') || 'Не выбраны'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Категории транспорта</h3>
            <ul className="space-y-1">
              {formData.special_vehicles && <li>• Спецтранспорт</li>}
              {formData.motorcycles && <li>• Мототехника</li>}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#1F1F1F] mx-2 sm:mx-4 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Мои данные</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel text="Телефон" required />
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white"
            placeholder="+7"
          />
        </div>

        <div ref={districtsRef} className="relative">
          <FieldLabel text="Районы работы" required />
          <button
            type="button"
            onClick={() => setIsDistrictsOpen(!isDistrictsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.districts.length > 0
                ? formData.districts.join(', ')
                : 'Выберите районы'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isDistrictsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isDistrictsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск районов...', 'districts')}
              {filterItems(spbDistricts, searchQueries.districts).map(district => (
                <label
                  key={district}
                  className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.districts.includes(district)}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        districts: prev.districts.includes(district)
                          ? prev.districts.filter(d => d !== district)
                          : [...prev.districts, district]
                      }));
                    }}
                    className="rounded bg-[#1F1F1F] mr-2"
                  />
                  <span className="text-sm">{district}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div ref={specializationsRef} className="relative">
          <FieldLabel text="Специализация" required />
          <button
            type="button"
            onClick={() => setIsSpecializationsOpen(!isSpecializationsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.specialization.length > 0
                ? formData.specialization.join(', ')
                : 'Выберите специализацию'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isSpecializationsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isSpecializationsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск специализаций...', 'specializations')}
              {filterItems(specializations, searchQueries.specializations).map(spec => (
                <label
                  key={spec}
                  className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.specialization.includes(spec)}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        specialization: prev.specialization.includes(spec)
                          ? prev.specialization.filter(s => s !== spec)
                          : [...prev.specialization, spec]
                      }));
                    }}
                    className="rounded bg-[#1F1F1F] mr-2"
                  />
                  <span className="text-sm">{spec}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div ref={carBrandsRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Марки легковых авто
          </label>
          <button
            type="button"
            onClick={() => setIsCarBrandsOpen(!isCarBrandsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.passenger_car_brands.length > 0
                ? formData.passenger_car_brands.join(', ')
                : 'Выберите марки'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isCarBrandsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isCarBrandsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск марок...', 'carBrands')}
              {Object.entries(carBrandsByRegion).map(([region, brands]) => {
                const filteredBrands = filterItems(brands, searchQueries.carBrands);
                if (filteredBrands.length === 0) return null;
                
                return (
                  <div key={region}>
                    <button
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className="w-full px-4 py-2 text-left hover:bg-[#3D3D3D] font-medium flex justify-between items-center"
                    >
                      <span>{region}</span>
                      <ChevronDown
                        className={`ml-2 transition-transform ${
                          expandedRegions.includes(region) ? 'rotate-180' : ''
                        }`}
                        size={16}
                      />
                    </button>
                    {expandedRegions.includes(region) && (
                      <div className="pl-4">
                        {filteredBrands.map(brand => (
                          <label
                            key={brand}
                            className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.passenger_car_brands.includes(brand)}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  passenger_car_brands: prev.passenger_car_brands.includes(brand)
                                    ? prev.passenger_car_brands.filter(b => b !== brand)
                                    : [...prev.passenger_car_brands, brand]
                                }));
                              }}
                              className="rounded bg-[#1F1F1F] mr-2"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div ref={truckBrandsRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Марки грузовых авто
          </label>
          <button
            type="button"
            onClick={() => setIsTruckBrandsOpen(!isTruckBrandsOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.truck_brands.length > 0
                ? formData.truck_brands.join(', ')
                : 'Выберите марки'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isTruckBrandsOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isTruckBrandsOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск марок...', 'truckBrands')}
              {Object.entries(truckBrandsByRegion).map(([region, brands]) => {
                const filteredBrands = filterItems(brands, searchQueries.truckBrands);
                if (filteredBrands.length === 0) return null;
                
                return (
                  <div key={region}>
                    <button
                      type="button"
                      onClick={() => toggleTruckRegion(region)}
                      className="w-full px-4 py-2 text-left hover:bg-[#3D3D3D] font-medium flex justify-between items-center"
                    >
                      <span>{region}</span>
                      <ChevronDown
                        className={`ml-2 transition-transform ${
                          expandedTruckRegions.includes(region) ? 'rotate-180' : ''
                        }`}
                        size={16}
                      />
                    </button>
                    {expandedTruckRegions.includes(region) && (
                      <div className="pl-4">
                        {filteredBrands.map(brand => (
                          <label
                            key={brand}
                            className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.truck_brands.includes(brand)}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  truck_brands: prev.truck_brands.includes(brand)
                                    ? prev.truck_brands.filter(b => b !== brand)
                                    : [...prev.truck_brands, brand]
                                }));
                              }}
                              className="rounded bg-[#1F1F1F] mr-2"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div ref={locksmithServicesRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Слесарные работы
          </label>
          <button
            type="button"
            onClick={() => setIsLocksmithServicesOpen(!isLocksmithServicesOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.locksmith_services.length > 0
                ? formData.locksmith_services.join(', ')
                : 'Выберите виды работ'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isLocksmithServicesOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isLocksmithServicesOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск работ...', 'locksmithServices')}
              {filterItems(locksmithServices, searchQueries.locksmithServices).map(service => (
                <label
                  key={service}
                  className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.locksmith_services.includes(service)}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        locksmith_services: prev.locksmith_services.includes(service)
                          ? prev.locksmith_services.filter(s => s !== service)
                          : [...prev.locksmith_services, service]
                      }));
                    }}
                    className="rounded bg-[#1F1F1F] mr-2"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div ref={roadsideServicesRef} className="relative">
          <label className="block text-sm text-gray-400 mb-1">
            Виды техпомощи
          </label>
          <button
            type="button"
            onClick={() => setIsRoadsideServicesOpen(!isRoadsideServicesOpen)}
            className="w-full bg-[#2D2D2D] rounded-lg px-4 py-2 text-white flex justify-between items-center"
          >
            <span className="truncate">
              {formData.roadside_services.length > 0
                ? formData.roadside_services.join(', ')
                : 'Выберите виды техпомощи'}
            </span>
            <ChevronDown
              className={`ml-2 transition-transform ${isRoadsideServicesOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {isRoadsideServicesOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#2D2D2D] rounded-lg shadow-lg max-h-60 overflow-auto">
              {renderSearchInput('Поиск услуг...', 'roadsideServices')}
              {filterItems(roadsideServices, searchQueries.roadsideServices).map(service => (
                <label
                  key={service}
                  className="flex items-center px-4 py-2 hover:bg-[#3D3D3D] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.roadside_services.includes(service)}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        roadside_services: prev.roadside_services.includes(service)
                          ? prev.roadside_services.filter(s => s !== service)
                          : [...prev.roadside_services, service]
                      }));
                    }}
                    className="rounded bg-[#1F1F1F] mr-2"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-3">
            Выберите категории транспорта
          </p>
          
          <div className="space-y-2">
            {[
              { key: 'special_vehicles', label: 'Спецтранспорт' },
              { key: 'motorcycles', label: 'Мототехника' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[key as keyof UserProfile] as boolean}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, [key]: e.target.checked }));
                  }}
                  className="rounded bg-[#2D2D2D]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#6B6BF9] text-white py-3 rounded-lg mt-6"
        >
          Сохранить данные
        </button>
      </form>
    </div>
  );
}