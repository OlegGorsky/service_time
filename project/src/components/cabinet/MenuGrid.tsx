import React from 'react';
import { MenuItem, MenuItemProps } from './MenuItem';
import { User, UserCheck, Plus, CreditCard, FileText, MessageSquare } from 'lucide-react';

interface MenuGridProps {
  activeMenuItem: string | null;
  setActiveMenuItem: (item: string | null) => void;
  isVerified: boolean;
  isProfileComplete: boolean | undefined;
}

type MenuItemConfig = {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  disabled?: boolean;
  completed?: boolean;
};

export function MenuGrid({ activeMenuItem, setActiveMenuItem, isVerified, isProfileComplete }: MenuGridProps) {
  const menuItems: MenuItemConfig[] = [
    {
      id: 'profile',
      icon: <User size={20} />,
      label: 'Мои данные',
      color: '#FF6B6B'
    },
    {
      id: 'verification',
      icon: <UserCheck size={20} />,
      label: 'Верификация',
      color: '#4ECDC4',
      disabled: isProfileComplete === false,
      completed: isVerified
    },
    {
      id: 'create',
      icon: <Plus size={20} />,
      label: 'Создать заявку',
      color: '#FFD93D',
      disabled: !isVerified
    },
    {
      id: 'payment',
      icon: <CreditCard size={20} />,
      label: 'Оплата',
      color: '#6C5CE7',
      disabled: !isVerified
    },
    {
      id: 'requests',
      icon: <FileText size={20} />,
      label: 'Мои заявки',
      color: '#A8E6CF',
      disabled: !isVerified
    },
    {
      id: 'support',
      icon: <MessageSquare size={20} />,
      label: 'Поддержка',
      color: '#FF9F9F'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
