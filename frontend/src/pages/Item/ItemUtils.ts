import type { ColumnsType } from "antd/es/table";
import type { AdPriority, AdStatus, HistoryRow, ModerationAction } from "../../types/Item.types";

export const REJECTION_REASONS = [
  'Запрещенный товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое',
] as const;

export const statusTextMap: Record<AdStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

export const priorityTextMap: Record<AdPriority, string> = {
  normal: 'Обычный',
  urgent: 'Срочный',
};

export const historyActionTextMap: Record<ModerationAction, string> = {
  pending: 'Создано',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  requestChanges: 'Запрос на доработку',
};

export const statusTagColor: Record<AdStatus, string> = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};

export const priorityTagColor: Record<AdPriority, string> = {
  normal: 'default',
  urgent: 'volcano',
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Неизвестно';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const historyColumns: ColumnsType<HistoryRow> = [
  {
    title: 'Дата и время',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (value: string) => formatDateTime(value),
  },
  {
    title: 'Модератор',
    dataIndex: 'moderatorName',
    key: 'moderatorName',
  },
  {
    title: 'Действие',
    dataIndex: 'action',
    key: 'action',
    render: (value: ModerationAction) => historyActionTextMap[value],
  },
  {
    title: 'Причина',
    dataIndex: 'reason',
    key: 'reason',
    render: (value?: string) => value || '—',
  },
  {
    title: 'Комментарий',
    dataIndex: 'comment',
    key: 'comment',
    render: (value?: string) => value || '',
  },
];
