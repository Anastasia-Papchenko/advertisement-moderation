import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FiltersInner } from './Filters';
import type { FiltersProps } from '../../types/filters.types';
import { statusOptions } from './FiltersUtils';

const createProps = (
  override: Partial<FiltersProps> = {},
): FiltersProps => ({
  statuses: [],
  categoryId: null,
  minPrice: '',
  maxPrice: '',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  categories: [
    { id: 1, name: 'Квартиры' },
    { id: 2, name: 'Комнаты' },
  ],
  onChange: vi.fn(),
  onReset: vi.fn(),
  ...override,
});

const renderFilters = (override: Partial<FiltersProps> = {}) => {
  const props = createProps(override);
  render(<FiltersInner {...props} />);
  return props;
};

describe('Filters', () => {
  it('вызывает onChange с обновлённым statuses при выборе статуса', () => {
    const props = renderFilters();

    const firstStatus = statusOptions[0]; 
    const checkbox = screen.getByLabelText(firstStatus.label);

    fireEvent.click(checkbox);

    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [firstStatus.value],
      }),
    );
  });

  it('вызывает onChange с обновлённым search при вводе текста в поиск', () => {
    const props = renderFilters();

    const searchInput = screen.getByPlaceholderText(
      /Введите название объявления/i,
    );

    fireEvent.change(searchInput, { target: { value: 'iphone' } });

    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'iphone',
      }),
    );
  });

  it('вызывает onChange с обновлёнными minPrice и maxPrice при изменении цены', () => {
    const props = renderFilters();

    const minInput = screen.getByPlaceholderText('от');
    const maxInput = screen.getByPlaceholderText('до');

    fireEvent.change(minInput, { target: { value: '1000' } });
    fireEvent.change(maxInput, { target: { value: '5000' } });

    expect(props.onChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        minPrice: '1000',
      }),
    );
    expect(props.onChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        maxPrice: '5000',
      }),
    );
  });
});
