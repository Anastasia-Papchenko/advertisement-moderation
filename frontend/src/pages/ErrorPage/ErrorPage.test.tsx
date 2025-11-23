import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorPage } from './ErrorPage';


type ErrorState = {
  message?: string;
  statusCode?: number;
};

const user = userEvent.setup();

const mockedNavigate = vi.fn();
let mockedState: ErrorState | undefined;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({ state: mockedState } as any),
  };
});



const renderErrorPage = (state?: ErrorState) => {
  mockedState = state;
  return render(<ErrorPage />);
};

const setHistoryLength = (len: number) => {
  Object.defineProperty(window.history, 'length', {
    configurable: true,
    value: len,
  });
};


beforeEach(() => {
  mockedNavigate.mockClear();
  mockedState = undefined;
  setHistoryLength(1);
});


describe('ErrorPage', () => {
  it('рендерит страницу 500 по умолчанию (без state)', () => {
    renderErrorPage();

    expect(screen.getByText('Произошла ошибка')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Что-то пошло не так. Попробуйте обновить страницу или вернуться к списку объявлений./i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Назад к списку' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Назад' }),
    ).toBeInTheDocument();
  });

  it('рендерит 404 и использует кастомное сообщение из state', () => {
    renderErrorPage({
      statusCode: 404,
      message: 'Нет такой страницы',
    });

    expect(screen.getByText('Страница не найдена')).toBeInTheDocument();
    expect(screen.getByText('Нет такой страницы')).toBeInTheDocument();
  });

  it('кнопка "Назад к списку" ведёт на /list', async () => {
    renderErrorPage();

    await user.click(
      screen.getByRole('button', { name: 'Назад к списку' }),
    );

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/list');
  });

  it('кнопка "Назад" при history.length > 1 делает navigate(-1)', async () => {
    setHistoryLength(2);
    renderErrorPage();

    await user.click(screen.getByRole('button', { name: 'Назад' }));

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it('кнопка "Назад" при history.length <= 1 ведёт на /list', async () => {
    setHistoryLength(1);
    renderErrorPage();

    await user.click(screen.getByRole('button', { name: 'Назад' }));

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/list');
  });
});
