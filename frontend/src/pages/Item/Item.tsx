import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Input, Radio, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import { LeftOutlined, RightOutlined, StarOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import styles from './Item.module.css';
import type { AdDetails, HistoryRow, RejectionReason } from '../../types/Item.types';
import { formatPrice, historyColumns, priorityTagColor, priorityTextMap, REJECTION_REASONS, statusTagColor, statusTextMap } from './ItemUtils';
import { formatShortDate } from '../Stats/StatsUtils';

const { Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const Item: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ad, setAd] = useState<AdDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [mainImageIndex, setMainImageIndex] = useState(0);

  type PanelMode = 'reject' | 'requestChanges' | null;
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedReason, setSelectedReason] =
    useState<RejectionReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/v1/ads/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Объявление не найдено');
          }
          throw new Error(`Ошибка загрузки (${res.status})`);
        }
        const data: AdDetails = await res.json();

        if (!cancelled) {
          setAd(data);
          setMainImageIndex(0);
          setPanelMode(null);
          setSelectedReason(null);
          setCustomReason('');
          setComment('');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Неизвестная ошибка загрузки',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAd();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const adIdNumber = useMemo(
    () => (id ? Number.parseInt(id, 10) || null : null),
    [id],
  );

  const handleBack = () => {
    navigate('/list');
  };

  const handlePrev = () => {
    if (!adIdNumber || adIdNumber <= 1) return;
    navigate(`/item/${adIdNumber - 1}`);
  };

  const handleNext = () => {
    if (!adIdNumber) return;
    navigate(`/item/${adIdNumber + 1}`);
  };

  const reloadFromResponse = (updatedAd: AdDetails) => {
    setAd(updatedAd);
    setPanelMode(null);
    setSelectedReason(null);
    setCustomReason('');
    setComment('');
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setActionError(null);

      const res = await fetch(`${API_BASE_URL}/api/v1/ads/${id}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Ошибка одобрения (${res.status})`);
      }

      const data: { ad: AdDetails } = await res.json();
      reloadFromResponse(data.ad);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Неизвестная ошибка при одобрении',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getFinalReason = (): string | null => {
    if (selectedReason === 'Другое') {
      return customReason.trim() ? customReason.trim() : null;
    }
    return selectedReason;
  };

  const handleSubmitWithReason = async (mode: 'reject' | 'requestChanges') => {
    if (!id) return;

    const reason = getFinalReason();
    if (!reason) {
      setActionError('Необходимо указать причину');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const endpoint =
        mode === 'reject'
          ? `${API_BASE_URL}/api/v1/ads/${id}/reject`
          : `${API_BASE_URL}/api/v1/ads/${id}/request-changes`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка отправки (${res.status})`);
      }

      const data: { ad: AdDetails } = await res.json();
      reloadFromResponse(data.ad);
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : 'Неизвестная ошибка при обновлении объявления',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const currentImage =
    ad && ad.images && ad.images.length > 0
      ? ad.images[Math.min(mainImageIndex, ad.images.length - 1)]
      : '';

  const handleReasonChange = (e: RadioChangeEvent) => {
    setSelectedReason(e.target.value as RejectionReason);
  };


  if (loading) {
    return (
      <div className={styles.itemPage}>
        <Card>
          <Spin tip="Загружаем объявление…" />
        </Card>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className={styles.itemPage}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="error"
            message={error || 'Объявление не найдено'}
            showIcon
          />
          <Button onClick={handleBack} >Назад к списку</Button>
        </Space>
      </div>
    );
  }


  return (
    <div className={styles.itemPage}>
      <Space
        direction="vertical"
        size={20}
        style={{ width: '100%' }}
      >
        <div className={styles.itemNav}>
          <div className={styles.itemNavLeft}>
            <Link to="/list">
              <Button type="default">
                Назад к списку
              </Button>
            </Link>
          </div>
          <div className={styles.itemNavRight}>
            <Button
              type="default"
              onClick={handlePrev}
              disabled={!adIdNumber || adIdNumber <= 1}
            >
              <LeftOutlined /> Предыдущее
            </Button>
            <Button
              type="default"
              onClick={handleNext}
            >
              Следующее <RightOutlined />
            </Button>
          </div>
        </div>

        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <section className={styles.gallerySection}>
                <div className={styles.galleryMain}>
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={ad.title}
                      className={styles.galleryMainImage}
                    />
                  ) : (
                    <div className={styles.galleryPlaceholder}>
                      Нет изображения
                    </div>
                  )}
                </div>

                {ad.images && ad.images.length > 1 && (
                  <div className={styles.galleryThumbs}>
                    {ad.images.map((img, idx) => (
                      <button
                        key={img + idx}
                        type="button"
                        className={`${styles.galleryThumbButton} ${
                          idx === mainImageIndex
                            ? styles.galleryThumbButtonActive
                            : ''
                        }`}
                        onClick={() => setMainImageIndex(idx)}
                      >
                        <img
                          src={img}
                          alt={`Изображение ${idx + 1}`}
                          className={styles.galleryThumbImage}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </Col>

            <Col xs={24} md={12}>
              <section className={styles.infoSection}>
                <header className={styles.infoHeader}>
                  <h1 className={styles.title}>{ad.title}</h1>

                  <div className={styles.price}>{formatPrice(ad.price)}</div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>{ad.category}</span>
                    <span className={styles.metaDot}>|</span>
                    <span className={styles.metaItem}>
                      Создано: {formatShortDate(ad.createdAt)}
                    </span>
                  </div>

                  <div className={styles.badgesRow}>
                    <Tag color={statusTagColor[ad.status]}>
                      {statusTextMap[ad.status]}
                    </Tag>
                    <Tag color={priorityTagColor[ad.priority]}>
                      {priorityTextMap[ad.priority]}
                    </Tag>
                  </div>
                </header>

                <section className={styles.block}>
                  <h2 className={styles.blockTitle}>Описание</h2>
                  <p className={styles.description}>{ad.description}</p>
                </section>

                {ad.characteristics &&
                  Object.keys(ad.characteristics).length > 0 && (
                    <section className={styles.block}>
                      <h2 className={styles.blockTitle}>Характеристики</h2>
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="key"
                        dataSource={Object.entries(
                          ad.characteristics || {},
                        ).map(([key, value]) => ({
                          key,
                          name: key,
                          value,
                        }))}
                        columns={[
                          {
                            title: 'Параметр',
                            dataIndex: 'name',
                            key: 'name',
                            width: '40%',
                          },
                          {
                            title: 'Значение',
                            dataIndex: 'value',
                            key: 'value',
                          },
                        ]}
                      />
                    </section>
                  )}

                <section className={styles.block}>
                  <h2 className={styles.blockTitle}>Информация о продавце</h2>
                  <div className={styles.sellerCard}>
                    <div className={styles.sellerName}>{ad.seller.name}</div>
                    <div className={styles.sellerRow}>
                      <span>Рейтинг: {ad.seller.rating} <StarOutlined /></span>
                      <span>Объявлений: {ad.seller.totalAds}</span>
                    </div>
                    <div className={styles.sellerRow}>
                      <span>
                        На сервисе с {formatShortDate(ad.seller.registeredAt)}
                      </span>
                    </div>
                  </div>
                </section>
              </section>
            </Col>
          </Row>
        </Card>

        <Card title="История модерации">
          {ad.moderationHistory && ad.moderationHistory.length > 0 ? (
            <Table<HistoryRow>
              size="small"
              rowKey="id"
              columns={historyColumns}
              dataSource={ad.moderationHistory}
              pagination={false}
            />
          ) : (
            <Text type="secondary">История модерации пока пуста.</Text>
          )}
        </Card>

        <Card title="Действия модератора">
          {actionError && (
            <Alert
              type="error"
              message={actionError}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Space style={{ marginBottom: 12 }} wrap>
            <Button
              type="primary"
              onClick={handleApprove}
              loading={actionLoading}
            >
              Одобрить
            </Button>
            <Button
              danger
              type="primary"
              onClick={() =>
                setPanelMode((prev) => (prev === 'reject' ? null : 'reject'))
              }
            >
              Отклонить
            </Button>
            <Button
              type="primary"
              style={{
                backgroundColor: '#faad14',
                borderColor: '#faad14',
              }}
              onClick={() =>
                setPanelMode((prev) =>
                  prev === 'requestChanges' ? null : 'requestChanges',
                )
              }
            >
              Вернуть на доработку
            </Button>
          </Space>

          {(panelMode === 'reject' || panelMode === 'requestChanges') && (
            <Space
              direction="vertical"
              size={12}
              style={{ width: '100%' }}
            >
              <div>
                <Text strong>Причина * </Text>
                <Radio.Group
                  onChange={handleReasonChange}
                  value={selectedReason}
                  style={{ marginTop: 8 }}
                >
                  <Space wrap>
                    {REJECTION_REASONS.map((reason) => (
                      <Radio.Button key={reason} value={reason}>
                        {reason}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>

                {selectedReason === 'Другое' && (
                  <Input
                    style={{ marginTop: 8 }}
                    placeholder="Укажите свою причину"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                )}
              </div>

              <div style={{ width: '100%' }}>
                <Text strong>Комментарий</Text>
                <TextArea
                  rows={3}
                  style={{ marginTop: 8 }}
                  placeholder="Добавьте комментарий для продавца (необязательно)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div>
                <Button
                  type="primary"
                  onClick={() =>
                    handleSubmitWithReason(
                      panelMode as 'reject' | 'requestChanges',
                    )
                  }
                  loading={actionLoading}
                >
                  {panelMode === 'reject'
                    ? 'Отклонить'
                    : 'Отправить запрос'}
                </Button>
              </div>
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
};
