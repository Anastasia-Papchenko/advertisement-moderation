import type { FiltersState, SortBy, SortOrder, StatusFilter } from '../types/filters.types';

const SORT_BY_VALUES: SortBy[] = ['createdAt', 'price', 'priority'];
const SORT_ORDER_VALUES: SortOrder[] = ['asc', 'desc'];

export const parseFromSearchParams = (
  params: URLSearchParams,
  currentFilters: FiltersState,
  currentPage: number
): { filters: FiltersState; page: number } => {
  const next: FiltersState = { ...currentFilters };

  const pageParam = params.get('page');
  let page = currentPage;
  if (pageParam) {
    const parsedPage = Number.parseInt(pageParam, 10);
    if (!Number.isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  const statusesParam = params.getAll('status') as StatusFilter[];
  if (statusesParam.length > 0) {
    next.statuses = statusesParam;
  }

  const categoryIdParam = params.get('categoryId');
  if (categoryIdParam !== null) {
    const parsedCat = Number.parseInt(categoryIdParam, 10);
    next.categoryId = Number.isNaN(parsedCat) ? null : parsedCat;
  }

  const minPriceParam = params.get('minPrice');
  if (minPriceParam !== null) {
    next.minPrice = minPriceParam;
  }

  const maxPriceParam = params.get('maxPrice');
  if (maxPriceParam !== null) {
    next.maxPrice = maxPriceParam;
  }

  const searchParam = params.get('search');
  if (searchParam !== null) {
    next.search = searchParam;
  }

  const sortByParam = params.get('sortBy') as SortBy | null;
  if (sortByParam && SORT_BY_VALUES.includes(sortByParam)) {
    next.sortBy = sortByParam;
  }

  const sortOrderParam = params.get('sortOrder') as SortOrder | null;
  if (sortOrderParam && SORT_ORDER_VALUES.includes(sortOrderParam)) {
    next.sortOrder = sortOrderParam;
  }

  return { filters: next, page };
};

export const buildSearchParams = (
  filters: FiltersState,
  page: number
): URLSearchParams => {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set('page', String(page));
  }

  filters.statuses.forEach((status) => {
    params.append('status', status);
  });

  if (filters.categoryId !== null) {
    params.set('categoryId', String(filters.categoryId));
  }

  if (filters.minPrice) {
    params.set('minPrice', filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set('maxPrice', filters.maxPrice);
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  if (filters.sortOrder) {
    params.set('sortOrder', filters.sortOrder);
  }

  return params;
};
