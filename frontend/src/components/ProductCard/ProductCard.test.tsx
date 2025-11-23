import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ProductCard from './ProductCard';
import type { ProductCardProps } from '../../types/product_card.types';

const user = userEvent.setup();

const baseProps: ProductCardProps = {
  image: 'https://example.com/image.jpg',
  title: 'Тестовое объявление',
  price: 12345,
  category: 'Квартиры',
  createdAt: '2024-06-15T00:00:00.000Z',
  status: 'approved',
  priority: 'normal',
  showCheckbox: false,
  checked: false,
  onToggleCheckbox: vi.fn(),
};

const renderCard = (override: Partial<ProductCardProps> = {}) => {
  const props: ProductCardProps = { ...baseProps, ...override };
  render(<ProductCard {...props} />);
  return props;
};

describe('ProductCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });


  it('показывает бейдж "Срочное" при priority="urgent", но без чекбокса если showCheckbox=false', async () => {
    const onToggleCheckbox = vi.fn();
    renderCard({
      priority: 'urgent',
      showCheckbox: false,
      onToggleCheckbox,
    });

    const urgentTag = screen.getByText('Срочное');
    expect(urgentTag).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(urgentTag);
    expect(onToggleCheckbox).not.toHaveBeenCalled();
  });

  it('рендерит чекбокс, когда showCheckbox=true, и он отражает checked', async () => {
    const onToggleCheckbox = vi.fn();
    renderCard({
      showCheckbox: true,
      checked: true,
      onToggleCheckbox,
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(onToggleCheckbox).toHaveBeenCalledTimes(1);
  });

  it('при priority="urgent" и showCheckbox=true клик по "Срочное" вызывает onToggleCheckbox через клик по верхней панели', async () => {
    const onToggleCheckbox = vi.fn();
    renderCard({
      priority: 'urgent',
      showCheckbox: true,
      onToggleCheckbox,
    });

    const urgentTag = screen.getByText('Срочное');
    await user.click(urgentTag);

    expect(onToggleCheckbox).toHaveBeenCalledTimes(1);
  });
});
