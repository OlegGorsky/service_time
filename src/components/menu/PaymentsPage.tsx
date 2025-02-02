import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { X } from 'lucide-react';

interface PaymentData {
  card_number: string | null;
  card_bank: string | null;
  sbp_phone: string | null;
  sbp_bank: string | null;
}

interface PaymentsPageProps {
  onClose: () => void;
}

export function PaymentsPage({ onClose }: PaymentsPageProps) {
  const { user } = useTelegramWebApp();
  const [activeTab, setActiveTab] = useState<'card' | 'sbp'>('card');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    card_number: '',
    card_bank: '',
    sbp_phone: '',
    sbp_bank: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPaymentData();
    }
  }, [user]);

  const loadPaymentData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('card_number, card_bank, sbp_phone, sbp_bank')
        .eq('telegram_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setPaymentData({
          card_number: data.card_number || '',
          card_bank: data.card_bank || '',
          sbp_phone: data.sbp_phone || '',
          sbp_bank: data.sbp_bank || ''
        });
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setError(null);
    setIsLoading(true);

    try {
      const updateData = activeTab === 'card' 
        ? { 
            card_number: paymentData.card_number,
            card_bank: paymentData.card_bank 
          }
        : { 
            sbp_phone: paymentData.sbp_phone,
            sbp_bank: paymentData.sbp_bank 
          };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('telegram_id', user.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error saving payment data:', error);
      setError('Ошибка при сохранении данных');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // 16 digits + 3 spaces
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '+7';
    if (numbers.length <= 1) return `+7`;
    return `+7 ${numbers.substring(1).match(/.{1,3}/g)?.join(' ') || ''}`.trim();
  };

  return (
    <div className="p-4 bg-[#1F1F1F] mx-2 sm:mx-4 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Способ оплаты</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-2 px-4 rounded-lg text-center transition-colors ${
            activeTab === 'card' 
              ? 'bg-[#6B6BF9] text-white' 
              : 'bg-[#2D2D2D] text-gray-400'
          }`}
        >
          На карту
        </button>
        <button
          onClick={() => setActiveTab('sbp')}
          className={`flex-1 py-2 px-4 rounded-lg text-center transition-colors ${
            activeTab === 'sbp' 
              ? 'bg-[#6B6BF9] text-white' 
              : 'bg-[#2D2D2D] text-gray-400'
          }`}
        >
          СБП
        </button>
      </div>

      {activeTab === 'card' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Номер карты
            </label>
            <input
              type="text"
              value={paymentData.card_number || ''}
              onChange={e => setPaymentData(prev => ({
                ...prev,
                card_number: formatCardNumber(e.target.value)
              }))}
              className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Название банка
            </label>
            <input
              type="text"
              value={paymentData.card_bank || ''}
              onChange={e => setPaymentData(prev => ({
                ...prev,
                card_bank: e.target.value
              }))}
              className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
              placeholder="Сбербанк"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Номер телефона
            </label>
            <input
              type="tel"
              value={paymentData.sbp_phone || '+7'}
              onChange={e => setPaymentData(prev => ({
                ...prev,
                sbp_phone: formatPhoneNumber(e.target.value)
              }))}
              className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
              placeholder="+7"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Название банка
            </label>
            <input
              type="text"
              value={paymentData.sbp_bank || ''}
              onChange={e => setPaymentData(prev => ({
                ...prev,
                sbp_bank: e.target.value
              }))}
              className="w-full bg-[#2D2D2D] rounded-lg px-4 py-3 text-white"
              placeholder="Сбербанк"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-[#6B6BF9] text-white py-3 rounded-lg mt-6 disabled:opacity-50"
      >
        {isLoading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}