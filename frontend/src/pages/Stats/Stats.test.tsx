import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Stats } from './Stats';
import type {
  StatsSummary,
  ActivityPoint,
  DecisionsDistribution,
  CategoriesChart,
} from '../../types/stats.types';


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
  (globalThis as any).fetch = vi.fn();
});

const renderStats = () =>
  render(
    <MemoryRouter initialEntries={['/stats']}>
      <Stats />
    </MemoryRouter>,
  );

describe('Stats page', () => {
  it('показывает Alert при ошибке загрузки любого из эндпоинтов', async () => {
    const fetchMock = (globalThis as any).fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    renderStats();

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByText('Ошибка загрузки статистики'),
    ).toBeInTheDocument();
  });

  it('показывает заглушку "Нет данных" для распределения решений при нулевых значениях', async () => {
    const summary: StatsSummary = {
      totalReviewed: 0,
      totalReviewedToday: 0,
      totalReviewedThisWeek: 0,
      totalReviewedThisMonth: 0,
      approvedPercentage: 0,
      rejectedPercentage: 0,
      requestChangesPercentage: 0,
      averageReviewTime: 0,
    };

    const activity: ActivityPoint[] = [];
    const decisions: DecisionsDistribution = {
      approved: 0,
      rejected: 0,
      requestChanges: 0,
    };
    const categories: CategoriesChart = {
      Квартиры: 5,
    };

    const fetchMock = (globalThis as any).fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => summary,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => activity,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => decisions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categories,
      });

    renderStats();

    await screen.findByText('Статистика модератора');

    const empties = screen.getAllByText('Нет данных для отображения.');
    expect(empties).toHaveLength(1);
  });

  it('показывает заглушку "Нет данных" для категорий при пустом объекте категорий', async () => {
    const summary: StatsSummary = {
      totalReviewed: 10,
      totalReviewedToday: 2,
      totalReviewedThisWeek: 5,
      totalReviewedThisMonth: 10,
      approvedPercentage: 0.5,
      rejectedPercentage: 0.4,
      requestChangesPercentage: 0.1,
      averageReviewTime: 600,
    };

    const activity: ActivityPoint[] = [];
    const decisions: DecisionsDistribution = {
      approved: 5,
      rejected: 3,
      requestChanges: 2,
    };
    const categories: CategoriesChart = {};

    const fetchMock = (globalThis as any).fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => summary,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => activity,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => decisions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categories,
      });

    renderStats();

    await screen.findByText('Статистика модератора');

    const empties = screen.getAllByText('Нет данных для отображения.');
    expect(empties).toHaveLength(1);
  });
});
