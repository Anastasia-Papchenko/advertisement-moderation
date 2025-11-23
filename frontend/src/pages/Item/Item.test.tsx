import { render, screen, fireEvent } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Item } from './Item';
import { formatPrice, REJECTION_REASONS } from './ItemUtils';
import { formatShortDate } from '../Stats/StatsUtils';
import { MemoryRouter } from 'react-router-dom';

const mockedNavigate = vi.fn();
let mockedId = '5';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ id: mockedId }),
  };
});


beforeAll(() => {
  (globalThis as any).ResizeObserver =
    (globalThis as any).ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

beforeEach(() => {
  mockedId = '5';
  mockedNavigate.mockClear();
  (globalThis as any).fetch = vi.fn();
});

const renderItem = () =>
  render(
    <MemoryRouter>
      <Item />
    </MemoryRouter>,
  );

const createMockAd = () => ({
  id: Number(mockedId),
  title: 'Тестовое объявление',
  price: 100000,
  category: 'Квартиры',
  createdAt: '2024-06-01T00:00:00.000Z',
  status: 'pending',
  priority: 'urgent',
  description: 'Описание объявления',
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  characteristics: {
    Комнаты: '2',
    Площадь: '50 м²',
  },
  seller: {
    name: 'Продавец Иван',
    rating: 4.7,
    totalAds: 20,
    registeredAt: '2023-01-10T00:00:00.000Z',
  },
  moderationHistory: [
    {
      id: 1,
      date: '2024-06-02T00:00:00.000Z',
      status: 'approved',
      moderator: 'Алексей Петров',
      reason: 'Принято',
      comment: 'Комментарий модератора',
    },
  ],
});


describe('Item page', () => {
  it('показывает ошибку и кнопку "Назад к списку" при неуспешной загрузке', async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    renderItem();

    expect(
      await screen.findByText('Объявление не найдено'),
    ).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: 'Назад к списку' });
    fireEvent.click(backBtn);

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/list');
  });

  it('успешно загружает и отображает объявление', async () => {
    const ad = createMockAd();

    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ad,
    });

    renderItem();

    expect(await screen.findByText(ad.title)).toBeInTheDocument();

    const priceText = formatPrice(ad.price).replace(/\u00A0/g, ' ');
    expect(screen.getByText(priceText)).toBeInTheDocument();

    expect(
      screen.getByText(`Создано: ${formatShortDate(ad.createdAt)}`),
    ).toBeInTheDocument();

    expect(screen.getByText(ad.description)).toBeInTheDocument();

    expect(screen.getByText(ad.seller.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Объявлений: ${ad.seller.totalAds}`),
    ).toBeInTheDocument();

    const mainImg = screen.getByAltText(ad.title);
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute('src', ad.images[0]);

    expect(screen.getByText('История модерации')).toBeInTheDocument();
    expect(
      screen.queryByText('История модерации пока пуста.'),
    ).not.toBeInTheDocument();
  });

  it('кнопки "Предыдущее" и "Следующее" навигируют к соседним объявлениям', async () => {
    const ad = createMockAd();

    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ad,
    });

    renderItem();

    await screen.findByText(ad.title);
    mockedNavigate.mockClear();

    const prevBtn = screen.getByRole('button', { name: /Предыдущее/i });
    const nextBtn = screen.getByRole('button', { name: /Следующее/i });

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);

    expect(mockedNavigate).toHaveBeenCalledTimes(2);
    expect(mockedNavigate).toHaveBeenNthCalledWith(1, '/item/4');
    expect(mockedNavigate).toHaveBeenNthCalledWith(2, '/item/6');
  });

  it('отправляет запрос одобрения объявления', async () => {
    const ad = createMockAd();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ad,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ad }),
      });

    (globalThis as any).fetch = fetchMock;

    renderItem();

    await screen.findByText(ad.title);

    const approveBtn = screen.getByRole('button', { name: 'Одобрить' });
    fireEvent.click(approveBtn);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, approveCall] = fetchMock.mock.calls;
    const [url, init] = approveCall;

    expect(String(url)).toContain(`/api/v1/ads/${mockedId}/approve`);
    expect(init).toMatchObject({ method: 'POST' });
  });

  it('отправляет запрос на доработку с выбранной причиной', async () => {
    const ad = createMockAd();
    const someReason =
      REJECTION_REASONS.find((r) => r !== 'Другое') ?? REJECTION_REASONS[0];

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ad,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ad }),
      });

    (globalThis as any).fetch = fetchMock;

    renderItem();

    await screen.findByText(ad.title);

    const toggleRequestBtn = screen.getByRole('button', {
      name: 'Вернуть на доработку',
    });
    fireEvent.click(toggleRequestBtn);

    fireEvent.click(screen.getByText(someReason));

    const commentInput = screen.getByPlaceholderText(
      'Добавьте комментарий для продавца (необязательно)',
    );
    fireEvent.change(commentInput, {
      target: { value: 'Комментарий модератора' },
    });

    const submitBtn = screen.getByRole('button', {
      name: 'Отправить запрос',
    });
    fireEvent.click(submitBtn);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, requestCall] = fetchMock.mock.calls;
    const [url, init] = requestCall;

    expect(String(url)).toContain(
      `/api/v1/ads/${mockedId}/request-changes`,
    );
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const body = JSON.parse(String((init as RequestInit).body));
    expect(body).toEqual({
      reason: someReason,
      comment: 'Комментарий модератора',
    });
  });
});
