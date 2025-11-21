import React from 'react';
import { Result, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

type ErrorState = {
  message?: string;
  statusCode?: number;
};

export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ErrorState | undefined) ?? {};

  const status: '404' | '500' =
    state.statusCode === 404 ? '404' : '500';

  const subTitle =
    state.message ||
    (status === '404'
      ? 'Страница не найдена. Возможно, она была удалена или вы перешли по неверной ссылке.'
      : 'Что-то пошло не так. Попробуйте обновить страницу или вернуться к списку объявлений.');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/list');
    }
  };

  const handleToList = () => {
    navigate('/list');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Result
        status={status}
        title={status === '404' ? 'Страница не найдена' : 'Произошла ошибка'}
        subTitle={subTitle}
        extra={[
          <Button type="primary" key="list" onClick={handleToList}>
            Назад к списку
          </Button>,
          <Button key="back" onClick={handleBack}>
            Назад
          </Button>,
        ]}
      />
    </div>
  );
};
