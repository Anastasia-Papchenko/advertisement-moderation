import type { AdCardProps } from "./productcard.types";

export type StatusFilter = AdCardProps['status'];
export type SortBy = 'createdAt' | 'price' | 'priority';
export type SortOrder = 'asc' | 'desc';

export type FiltersState = {
  statuses: StatusFilter[];
  categoryId: number | null;
  minPrice: string;
  maxPrice: string;
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
};

export type CategoryOption = {
  id: number;
  name: string;
};

export type FiltersProps = FiltersState & {
  categories: CategoryOption[];
  onChange: (next: FiltersState) => void;
  onReset: () => void;
};