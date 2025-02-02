import React from 'react';
import { supabase } from '../../lib/supabase';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { Clock, MapPin, Wrench, Car, CreditCard, MessageSquare, Edit, CheckCircle, XCircle } from 'lucide-react';
import { EditOrderPage } from '../menu/EditOrderPage';
import { logger } from '../../lib/logger';

interface Order {
  id: string;
  client_phone: string;
  client_address: string;
  vehicle_year: number;
  amount: number;
  commission: number;
  comment: string;
  created_at: string;
  taken_at: string | null;
  completed_at: string | null;
  created_by: string;
  taken_by: string | null;
  status: string;
  districts: string[];
  specialization: string[];
  passenger_car_brands: string[];
  truck_brands: string[];
  locksmith_services: string[];
  roadside_services: string[];
  special_vehicles: boolean;
  motorcycles: boolean;
}

interface RequestsContentProps {
  activeRequestTab: string;
}

const STATUS_COLORS = {
  available: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Свободна' },
  in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'В работе' },
  pending_payment: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Ждет оплаты' },
  completed: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Завершена' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Отменена' }
} as const;

export default function RequestsContent({ activeRequestTab }: RequestsContentProps) {
  const { user } = useTelegramWebApp();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [processingOrderId, setProcessingOrderId] = React.useState<string | null>(null);
  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadOrders();
    }
  }, [user, activeRequestTab]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          districts,
          specialization,
          passenger_car_brands,
          truck_brands,
          locksmith_services,
          roadside_services,
          special_vehicles,
          motorcycles
        `)
        .eq('telegram_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      logger.error('Error loading user profile:', error);
    }
  };

  const loadOrders = async () => {
    if (!user?.id || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      switch (activeRequestTab) {
        case 'available':
          query = query
            .eq('status', 'available')
            .neq('created_by', user.id);
          break;
        case 'my':
          query = query
            .eq('created_by', user.id);
          break;
        case 'inProgress':
          query = query
            .eq('taken_by', user.id)
            .eq('status', 'in_progress');
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      if (activeRequestTab === 'available') {
        const filteredOrders = (data as Order[]).filter((order: Order) => {
          const districtMatch = order.districts.some((district: string) => 
            userProfile.districts.includes(district)
          );

          const specializationMatch = order.specialization.some((spec: string) => 
            userProfile.specialization.includes(spec)
          );

          const vehicleMatch = (
            (order.passenger_car_brands?.length > 0 && userProfile.passenger_car_brands?.some((brand: string) => order.passenger_car_brands.includes(brand))) ||
            (order.truck_brands?.length > 0 && userProfile.truck_brands?.some((brand: string) => order.truck_brands.includes(brand))) ||
            (order.locksmith_services?.length > 0 && userProfile.locksmith_services?.some((service: string) => order.locksmith_services.includes(service))) ||
            (order.roadside_services?.length > 0 && userProfile.roadside_services?.some((service: string) => order.roadside_services.includes(service))) ||
            (order.special_vehicles && userProfile.special_vehicles) ||
            (order.motorcycles && userProfile.motorcycles)
          );

          return districtMatch && specializationMatch && vehicleMatch;
        });

        setOrders(filteredOrders);
      } else {
        setOrders(data as Order[] || []);
      }
    } catch (error) {
      logger.error('Error loading orders:', error);
      setError('Ошибка при загрузке заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCancelOrder = async (order: Order) => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.showConfirm) return;

    const confirmResult = await webApp.showConfirm(
      'Вы уверены, что хотите отменить заявку?'
    );

    if (confirmResult) {
      setProcessingOrderId(order.id);
      try {
        // First check if the order is still available
        const { data: currentOrder, error: checkError } = await supabase
          .from('orders')
          .select('status')
          .eq('id', order.id)
          .single();

        if (checkError) throw checkError;

        if (currentOrder.status !== 'available') {
          throw new Error('Заявка уже не доступна для отмены');
        }

        // Then update the order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            taken_by: null,
            taken_at: null,
            completed_at: null
          })
          .eq('id', order.id)
          .eq('created_by', user?.id)
          .eq('status', 'available');

        if (updateError) throw updateError;

        // Refresh orders list
        await loadOrders();

        webApp.showPopup({
          title: 'Готово',
          message: 'Заявка отменена',
          buttons: [{ type: 'close' }]
        });
      } catch (error) {
        logger.error('Error cancelling order:', error);
        webApp.showPopup({
          title: 'Ошибка',
          message: error instanceof Error ? error.message : 'Не удалось отменить заявку',
          buttons: [{ type: 'close' }]
        });
      } finally {
        setProcessingOrderId(null);
      }
    }
  };

  const handleEditOrder = (order: Order) => {
    logger.info('Edit button clicked for order:', order.id);
    setEditingOrder(order);
  };

  const handleOrderUpdate = async () => {
    logger.info('Order updated, refreshing list');
    await loadOrders();
    setEditingOrder(null);
  };

  const handleCloseEdit = () => {
    setEditingOrder(null);
  };

  const handleTakeOrder = async (order: Order) => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.showConfirm) return;

    const confirmResult = await webApp.showConfirm(
      'Вы уверены, что хотите взять эту заявку?'
    );

    if (confirmResult) {
      setProcessingOrderId(order.id);
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'in_progress',
            taken_by: user?.id,
            taken_at: new Date().toISOString()
          })
          .eq('id', order.id)
          .eq('status', 'available');

        if (error) throw error;

        loadOrders();

        webApp.showPopup({
          title: 'Готово',
          message: 'Заявка взята в работу',
          buttons: [{ type: 'close' }]
        });
      } catch (error) {
        logger.error('Error taking order:', error);
        webApp.showPopup({
          title: 'Ошибка',
          message: 'Не удалось взять заявку',
          buttons: [{ type: 'close' }]
        });
      } finally {
        setProcessingOrderId(null);
      }
    }
  };

  const handleCompleteOrder = async (order: Order) => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.showConfirm) return;

    const confirmResult = await webApp.showConfirm(
      'Вы уверены, что хотите завершить заявку?'
    );

    if (confirmResult) {
      setProcessingOrderId(order.id);
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', order.id)
          .eq('taken_by', user?.id)
          .eq('status', 'in_progress');

        if (error) throw error;

        loadOrders();

        webApp.showPopup({
          title: 'Готово',
          message: 'Заявка завершена',
          buttons: [{ type: 'close' }]
        });
      } catch (error) {
        logger.error('Error completing order:', error);
        webApp.showPopup({
          title: 'Ошибка',
          message: 'Не удалось завершить заявку',
          buttons: [{ type: 'close' }]
        });
      } finally {
        setProcessingOrderId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#1F1F1F] mx-4 rounded-2xl p-4">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6B6BF9]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#1F1F1F] mx-4 rounded-2xl p-4">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 bg-[#1F1F1F] mx-4 rounded-2xl p-4">
        <p className="text-gray-400">
          {activeRequestTab === 'available' && 'Доступных заявок пока нет'}
          {activeRequestTab === 'my' && 'У вас пока нет заявок'}
          {activeRequestTab === 'inProgress' && 'Нет заявок в работе'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 bg-[#1F1F1F] mx-4 rounded-2xl">
        <div className="p-4 space-y-2">
          {orders.map(order => {
            const statusConfig = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.available;
            const isProcessing = processingOrderId === order.id;
            const canEdit = order.created_by === user?.id && order.status === 'available';
            const canCancel = order.created_by === user?.id && order.status === 'available';
            
            return (
              <div 
                key={order.id} 
                className="bg-[#2D2D2D] rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-[#6B6BF9]/20 text-[#6B6BF9]">
                      {formatMoney(order.amount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="truncate">{order.client_address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Car size={14} className="text-gray-400" />
                    <span>{order.vehicle_year} г.в.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Wrench size={14} className="text-gray-400" />
                    <span className="truncate">{order.specialization.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400" />
                    <span>{formatMoney(order.commission)}</span>
                  </div>
                </div>

                {order.comment && (
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-400 line-clamp-1">{order.comment}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {activeRequestTab === 'available' && order.status === 'available' && (
                    <button
                      className="flex-1 bg-[#6B6BF9]/20 hover:bg-[#6B6BF9]/30 text-[#6B6BF9] py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      onClick={() => handleTakeOrder(order)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#6B6BF9] border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Взять заявку
                        </>
                      )}
                    </button>
                  )}
                  {canEdit && (
                    <>
                      <button
                        className="flex-1 bg-[#6B6BF9]/20 hover:bg-[#6B6BF9]/30 text-[#6B6BF9] py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        onClick={() => handleEditOrder(order)}
                        disabled={isProcessing}
                      >
                        <Edit size={14} />
                        Изменить
                      </button>
                      <button
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        onClick={() => handleCancelOrder(order)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <>
                            <XCircle size={14} />
                            Отменить
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {activeRequestTab === 'inProgress' && order.status === 'in_progress' && (
                    <button
                      className="flex-1 bg-[#6B6BF9]/20 hover:bg-[#6B6BF9]/30 text-[#6B6BF9] py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      onClick={() => handleCompleteOrder(order)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#6B6BF9] border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Завершить
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingOrder && (
        <EditOrderPage
          order={editingOrder}
          onClose={handleCloseEdit}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
}
