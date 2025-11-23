import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalWindow } from './ModalWindow';
import type { ModalWindowProps } from '../../types/modal_window.types';
import { REJECTION_REASONS } from '../../pages/Item/ItemUtils';

const user = userEvent.setup();

const createProps = (
  override: Partial<ModalWindowProps> = {},
): ModalWindowProps => ({
  open: true,
  mode: 'approve',
  selectedIds: [1],
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  ...override,
});

describe('ModalWindow', () => {
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderModal = (override: Partial<ModalWindowProps> = {}) => {
    const props = createProps(override);
    render(<ModalWindow {...props} />);
    return props;
  };

  it('рендерит модалку для одобрения с правильным заголовком и текстом', () => {
    renderModal({ mode: 'approve', selectedIds: [1, 2, 3] });

    expect(
      screen.getByText('Подтвердить одобрение'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Одобрить объявления \(3 шт\.\)\?/),
    ).toBeInTheDocument();
  });

  it('при одобрении вызывает API для каждого id и колбэки onSuccess/onClose', async () => {
    const props = renderModal({ mode: 'approve', selectedIds: [10, 20] });

    const okButton = screen.getByRole('button', { name: 'Одобрить' });
    await user.click(okButton);

    const fetchMock = (globalThis as any).fetch;

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ads/10/approve'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ads/20/approve'),
      expect.objectContaining({ method: 'POST' }),
    );

    expect(props.onSuccess).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('рендерит модалку для отклонения с причинами и полем комментария', () => {
    renderModal({ mode: 'reject' });

    expect(
      screen.getByText('Укажите причину отклонения'),
    ).toBeInTheDocument();
    expect(screen.getByText('Причина *')).toBeInTheDocument();
    expect(screen.getByText('Комментарий')).toBeInTheDocument();

    REJECTION_REASONS.forEach((reason) => {
      expect(screen.getByText(reason)).toBeInTheDocument();
    });
  });

  it('показывает ошибку, если отправить отклонение без выбранной причины', async () => {
    renderModal({ mode: 'reject' });

    const okButton = screen.getByRole('button', { name: 'Отклонить' });
    await user.click(okButton);

    const fetchMock = (globalThis as any).fetch;
    expect(fetchMock).not.toHaveBeenCalled();

    expect(
      screen.getByText('Необходимо указать причину'),
    ).toBeInTheDocument();
  });

  it('отправляет отклонение с выбранной предустановленной причиной и комментарием', async () => {
    const props = renderModal({ mode: 'reject', selectedIds: [42] });

    const someReason =
      REJECTION_REASONS.find((r) => r !== 'Другое') ?? REJECTION_REASONS[0];

    await user.click(screen.getByText(someReason));

    const commentField = screen.getByPlaceholderText(
      'Добавьте комментарий (необязательно)',
    );
    await user.type(commentField, ' Коммент ');

    const okButton = screen.getByRole('button', { name: 'Отклонить' });
    await user.click(okButton);

    const fetchMock = (globalThis as any).fetch;

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ads/42/reject'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: someReason,
          comment: 'Коммент', 
        }),
      }),
    );

    expect(props.onSuccess).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('показывает поле для ввода кастомной причины при выборе "Другое" и валидирует её', async () => {
    renderModal({ mode: 'reject' });

    await user.click(screen.getByText('Другое'));

    const customInput = screen.getByPlaceholderText('Укажите свою причину');
    expect(customInput).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: 'Отклонить' });
    await user.click(okButton);

    expect(
      screen.getByText('Необходимо указать причину'),
    ).toBeInTheDocument();

    await user.type(customInput, 'Спам');

    await user.click(okButton);

    const fetchMock = (globalThis as any).fetch;

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/reject'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          reason: 'Спам',
          comment: undefined,
        }),
      }),
    );
  });

  it('показывает Alert с ошибкой, если запрос на сервер падает, и не вызывает onSuccess/onClose', async () => {
    (globalThis as any).fetch = vi
      .fn()
      .mockRejectedValue(new Error('Сервер недоступен'));

    const props = renderModal({ mode: 'reject', selectedIds: [1] });

    const someReason =
      REJECTION_REASONS.find((r) => r !== 'Другое') ?? REJECTION_REASONS[0];

    await user.click(screen.getByText(someReason));

    const okButton = screen.getByRole('button', { name: 'Отклонить' });
    await user.click(okButton);

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);

    expect(
      await screen.findByText('Сервер недоступен'),
    ).toBeInTheDocument();

    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });
});
