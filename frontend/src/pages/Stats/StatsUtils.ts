export const formatPercent = (value: number | undefined | null) =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `${value.toFixed(1)}%`
    : '—';

export const formatSecondsToTime = (seconds: number | undefined | null) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) {
    return '-';
  }
  if (seconds < 60) {
    return `${Math.round(seconds)} сек.`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} мин.`;
};

export const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(d);
};