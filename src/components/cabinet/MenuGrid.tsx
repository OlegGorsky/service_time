import React, { useState, useEffect } from 'react';
import { Shield, ClipboardList, CreditCard, FileText, SendHorizontal } from 'lucide-react';
import { MenuItem } from './MenuItem';
import { supabase } from '../../lib/supabase';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface MenuGridProps {
  activeMenuItem: string | null;
  setActiveMenuItem: (item: string | null) => void;
  isVerified: boolean;
  isProfileComplete?: boolean;
}

export function MenuGrid({ activeMenuItem, setActiveMenuItem, isVerified, isProfileComplete }: MenuGridProps) {
  const { user } = useTelegramWebApp();
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [hasRequiredData, setHasRequiredData] = useState(false);

  useEffect(() => {
    const checkUserData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            phone,
            districts,
            specialization,
            passenger_car_brands,
            truck_brands,
            locksmith_services,
            roadside_services,
            card_number,
            card_bank,
            sbp_phone,
            sbp_bank
          `)
          .eq('telegram_id', user.id)
          .single();

        if (error) throw error;

        // Check if user has required profile data
        const hasProfileData = Boolean(
          data?.phone && 
          data?.districts?.length > 0 && 
          data?.specialization?.length > 0 &&
          (
            (data?.passenger_car_brands?.length > 0 || data?.truck_brands?.length > 0) &&
            (data?.locksmith_services?.length > 0 || data?.roadside_services?.length > 0)
          )
        );
        setHasRequiredData(hasProfileData);

        // Check if user has payment method
        const hasPayment = Boolean(
          (data?.card_number && data?.card_bank) || 
          (data?.sbp_phone && data?.sbp_bank)
        );
        setHasPaymentMethod(hasPayment);
      } catch (error) {
        console.error('Error checking user data:', error);
        setHasRequiredData(false);
        setHasPaymentMethod(false);
      }
    };

    checkUserData();
  }, [user]);

  const topMenuItems = [
    {
      icon: <FileText className={hasRequiredData ? "text-[#4CAF50]" : "text-[#FF6B6B]"} />,
      title: "Мои данные",
      bgColor: hasRequiredData ? "bg-[#1D2D1D]" : "bg-[#2D1D1D]",
      id: "profile"
    },
    {
      icon: <Shield className={isVerified ? "text-[#4CAF50]" : "text-[#FF6B6B]"} />,
      title: "Верификация",
      bgColor: isVerified ? "bg-[#1D2D1D]" : "bg-[#2D1D1D]",
      id: "verification"
    },
    {
      icon: <CreditCard className={hasPaymentMethod ? "text-[#4CAF50]" : "text-[#FF6B6B]"} />,
      title: "Платежи",
      bgColor: hasPaymentMethod ? "bg-[#1D2D1D]" : "bg-[#2D1D1D]",
      id: "payment"
    }
  ];

  return (
    <div className="p-2 sm:p-4 space-y-4">
      {/* Top row with three buttons */}
      <div className="grid grid-cols-3 gap-2">
        {topMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            bgColor={item.bgColor}
            isActive={activeMenuItem === item.id}
            onClick={() => setActiveMenuItem(item.id)}
          />
        ))}
      </div>

      {/* Full-width button below */}
      <button
        onClick={() => setActiveMenuItem("create")}
        className={`w-full bg-[#6B6BF9]/20 hover:bg-[#6B6BF9]/30 active:scale-95 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all ${
          activeMenuItem === "create" ? 'ring-2 ring-[#6B6BF9]' : ''
        }`}
      >
        <SendHorizontal className="text-[#6B6BF9] w-6 h-6" />
        <span className={`text-lg font-medium ${
          activeMenuItem === "create" ? 'text-[#6B6BF9]' : 'text-gray-300'
        }`}>
          Отправить заявку
        </span>
      </button>
    </div>
  );
}