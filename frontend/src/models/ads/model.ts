import { createStore, createEvent, createEffect } from 'effector';
import type { CategoryOption, FiltersState } from '../../types/filters.types';
import type { AdsResponse, ApiAd } from '../../types/model.types';

const VITE_API_URL_BACK =
  import.meta.env.VITE_VITE_API_URL_BACK ?? 'http://localhost:3001';

const PAGE_SIZE = 10;

const initialFilters: FiltersState = {
  statuses: [],
  categoryId: null,
  minPrice: '',
  maxPrice: '',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};


export const pageChanged = createEvent<number>();
export const filtersChanged = createEvent<FiltersState>();
export const filtersReset = createEvent();


export const $page = createStore(1)
  .on(pageChanged, (_, page) => page)
  .on(filtersChanged, () => 1) 
  .on(filtersReset, () => 1);

export const $filters = createStore<FiltersState>(initialFilters)
  .on(filtersChanged, (_, next) => next)
  .on(filtersReset, () => initialFilters);

export const fetchAdsFx = createEffect<
  { page: number; filters: FiltersState },
  AdsResponse,
  Error
>(async ({ page, filters }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(PAGE_SIZE));

  const { statuses, categoryId, minPrice, maxPrice, search, sortBy, sortOrder } = filters;

  if (statuses.length > 0) {
    statuses.forEach((s) => params.append('status', s));
  }

  if (categoryId !== null) {
    params.set('categoryId', String(categoryId));
  }

  if (minPrice.trim() !== '') {
    params.set('minPrice', minPrice.trim());
  }

  if (maxPrice.trim() !== '') {
    params.set('maxPrice', maxPrice.trim());
  }

  if (maxPrice.trim() !== '') {
    params.set('maxPrice', maxPrice.trim());
  }

  if (search.trim() !== '') {
    params.set('search', search.trim());
  }

  params.set('sortBy', sortBy);
  params.set('sortOrder', sortOrder);

  const response = await fetch(
    `${VITE_API_URL_BACK}/api/v1/ads?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка загрузки (${response.status})`);
  }

  const data: AdsResponse = await response.json();
  return data;
});

export const $ads = createStore<ApiAd[]>([]).on(
  fetchAdsFx.doneData,
  (_, data) => data.ads
);

export const $totalPages = createStore(1).on(
  fetchAdsFx.doneData,
  (_, data) => data.pagination?.totalPages ?? 1
);

export const $totalItems = createStore(0).on(
  fetchAdsFx.doneData,
  (_, data) => data.pagination?.totalItems ?? data.ads.length
);

export const $categories = createStore<CategoryOption[]>([]).on(
  fetchAdsFx.doneData,
  (prev, data) => {
    const map = new Map<number, string>();
    prev.forEach((c) => map.set(c.id, c.name));
    data.ads.forEach((ad) => {
      map.set(ad.categoryId, ad.category);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }
);

export const $loading = fetchAdsFx.pending;

export const $error = createStore<string | null>(null)
  .on(fetchAdsFx.failData, (_, error) =>
    error instanceof Error
      ? error.message
      : 'Неизвестная ошибка загрузки'
  )
  .reset(fetchAdsFx.done);
