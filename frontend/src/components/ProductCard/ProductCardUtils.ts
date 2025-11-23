import type { AdCardProps } from "../../types/product_card.types";

export const statusTextMap: Record<AdCardProps['status'], string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

export const priorityTextMap: Record<AdCardProps['priority'], string> = {
  normal: 'Обычный',
  urgent: 'Срочный',
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Неизвестно';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

export const getStatusStyles = (status: AdCardProps['status']) => {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'approved':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'rejected':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    default:
      return {};
  }
};

export const getPriorityStyles = (priority: AdCardProps['priority']) => {
  switch (priority) {
    case 'normal':
      return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    case 'urgent':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    default:
      return {};
  }
};