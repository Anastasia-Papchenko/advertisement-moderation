import type { StatusFilter } from "../../types/filters.types";

export const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
];