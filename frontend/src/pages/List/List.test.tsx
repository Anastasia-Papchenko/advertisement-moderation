import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

type Status = 'pending' | 'approved' | 'rejected';
type Priority = 'normal' | 'urgent';
type SortBy = 'createdAt' | 'price' | 'priority';
type SortOrder = 'asc' | 'desc';

type FiltersState = {
  statuses: Status[];
  categoryId: number | null;
  minPrice: string;
  maxPrice: string;
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
};

type ListAd = {
  id: number;
  title: string;
  price: number;
  category: string;
  createdAt: string;
  status: Status;
  priority: Priority;
  images?: string[];
};

const defaultFilters: FiltersState = {
  statuses: [],
  categoryId: null,
  minPrice: '',
  maxPrice: '',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const storeState: {
  ads: ListAd[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalItems: number;
  categories: { id: number; name: string }[];
  filters: FiltersState;
} = {
  ads: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  totalItems: 0,
  categories: [],
  filters: { ...defaultFilters },
};

const handlers = {
  changePage: vi.fn<(page: number) => void>(),
  changeFilters: vi.fn<(filters: FiltersState) => void>(),
  resetFilters: vi.fn<() => void>(),
  loadAds: vi.fn<(args: { page: number; filters: FiltersState }) => void>(),
};

const resetState = () => {
  storeState.ads = [];
  storeState.loading = false;
  storeState.error = null;
  storeState.page = 1;
  storeState.totalPages = 1;
  storeState.totalItems = 0;
  storeState.categories = [];
  storeState.filters = { ...defaultFilters };

  handlers.changePage.mockClear();
  handlers.changeFilters.mockClear();
  handlers.resetFilters.mockClear();
  handlers.loadAds.mockClear();
};

vi.mock('effector-react', () => {
  return {
    useUnit: (shape: Record<string, unknown>) => {
      if ('ads' in shape) {
        return {
          ads: storeState.ads,
          loading: storeState.loading,
          error: storeState.error,
          page: storeState.page,
          totalPages: storeState.totalPages,
          totalItems: storeState.totalItems,
          categories: storeState.categories,
          filters: storeState.filters,
        };
      }

      return {
        changePage: handlers.changePage,
        changeFilters: handlers.changeFilters,
        resetFilters: handlers.resetFilters,
        loadAds: handlers.loadAds,
      };
    },
  };
});

vi.mock('../../models/ads/model', () => {
  const dummyStore = {} as unknown;

  return {
    $ads: dummyStore,
    $categories: dummyStore,
    $error: dummyStore,
    $filters: dummyStore,
    $loading: dummyStore,
    $page: dummyStore,
    $totalItems: dummyStore,
    $totalPages: dummyStore,
    fetchAdsFx: vi.fn(),
    filtersChanged: vi.fn(),
    filtersReset: vi.fn(),
    pageChanged: vi.fn(),
  };
});

import { List } from './List';


const renderList = () =>
  render(
    <MemoryRouter>
      <List />
    </MemoryRouter>,
  );


describe('List page', () => {
  beforeEach(() => {
    resetState();
  });

  it('вызывает loadAds при маунте с текущей страницей и фильтрами', async () => {
    storeState.page = 2;
    storeState.filters = {
      ...defaultFilters,
      search: 'iphone',
    };

    renderList();

    await waitFor(() => {
      expect(handlers.loadAds).toHaveBeenCalledTimes(1);
    });

    expect(handlers.loadAds).toHaveBeenCalledWith({
      page: 2,
      filters: storeState.filters,
    });
  });

  it('показывает Alert при ошибке загрузки', () => {
    storeState.error = 'Сервер недоступен';

    renderList();

    expect(
      screen.getByText('Ошибка при загрузке объявлений'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Сервер недоступен'),
    ).toBeInTheDocument();
  });

  it('показывает Empty, когда объявлений нет и ошибки нет', () => {
    storeState.error = null;
    storeState.ads = [];
    storeState.totalItems = 0;

    renderList();

    expect(
      screen.getByText('Объявления не найдены'),
    ).toBeInTheDocument();
  });

  it('рендерит карточки объявлений и пагинацию, когда есть объявления', () => {
    storeState.error = null;
    storeState.ads = [
      {
        id: 1,
        title: 'Объявление 1',
        price: 1000,
        category: 'Квартиры',
        createdAt: '2024-06-01T00:00:00.000Z',
        status: 'approved',
        priority: 'normal',
        images: ['https://example.com/1.jpg'],
      },
      {
        id: 2,
        title: 'Объявление 2',
        price: 2000,
        category: 'Квартиры',
        createdAt: '2024-06-02T00:00:00.000Z',
        status: 'pending',
        priority: 'urgent',
        images: [],
      },
    ];
    storeState.totalItems = 2;
    storeState.totalPages = 1;

    renderList();

    expect(
      screen.getByText('Объявление 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Объявление 2'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Выбрано:'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Страница 1 из 1'),
    ).toBeInTheDocument();
  });
});
