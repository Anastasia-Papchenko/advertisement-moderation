import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { Card, Typography, Spin, Row, Col, Empty, Alert, Pagination, Space, Button } from 'antd';

import ProductCard from '../../components/ProductCard/ProductCard';
import { Filters } from '../../components/Filters/Filters';
import type { FiltersState } from '../../types/filters.types.ts';
import { BarChartOutlined } from '@ant-design/icons';

import { $ads, $categories, $error, $filters, $loading, $page, $totalItems, $totalPages, fetchAdsFx, filtersChanged, filtersReset, pageChanged } from '../../models/ads/model';

import styles from './List.module.css';
import { ModalWindow } from '../../components/ModalWindow/ModalWindow.tsx';

const { Title, Text } = Typography;

type BulkMode = 'approve' | 'reject' | null;

export const List: React.FC = () => {
  const { ads, loading, error, page, totalPages, totalItems, categories, filters } =
    useUnit({
      ads: $ads,
      loading: $loading,
      error: $error,
      page: $page,
      totalPages: $totalPages,
      totalItems: $totalItems,
      categories: $categories,
      filters: $filters,
    });

  const { changePage, changeFilters, resetFilters, loadAds } = useUnit({
    changePage: pageChanged,
    changeFilters: filtersChanged,
    resetFilters: filtersReset,
    loadAds: fetchAdsFx,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [bulkMode, setBulkMode] = useState<BulkMode>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  useEffect(() => {
    loadAds({ page, filters });
  }, [page, filters, loadAds]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => ads.some((ad) => ad.id === id)));
  }, [ads]);

  const handleFiltersChange = (next: FiltersState) => {
    changePage(1);
    changeFilters(next);
  };

  const handleFiltersReset = () => {
    resetFilters();
    changePage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage !== page) {
      changePage(nextPage);
    }
  };

  const pageSize = totalPages > 0 ? Math.ceil(totalItems / totalPages) : 10;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllOnPage = () => {
    setSelectedIds(ads.map((ad) => ad.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const openBulkApproveModal = () => {
    if (!selectedIds.length) return;
    setBulkMode('approve');
    setBulkModalOpen(true);
  };

  const openBulkRejectModal = () => {
    if (!selectedIds.length) return;
    setBulkMode('reject');
    setBulkModalOpen(true);
  };

  const handleBulkClose = () => {
    setBulkModalOpen(false);
    setBulkMode(null);
  };

  const handleBulkSuccess = () => {
    clearSelection();
    loadAds({ page, filters });
  };

  return (
    <div className={styles.listPage}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                Объявления
              </Title>
              <Text type="secondary">
                Всего объявлений: <Text strong>{totalItems}</Text>
              </Text>
            </Space>
          </Col>

          <Col>
            <Link to="/stats">
              <Button type="default">
                <BarChartOutlined />
                Статистика
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      <Filters
        {...filters}
        categories={categories}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      <Card style={{ marginTop: 16 }}>
        <Spin spinning={loading}>
          {error && (
            <Alert
              type="error"
              message="Ошибка при загрузке объявлений"
              description={error}
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {!error && !loading && ads.length === 0 && (
            <Empty description="Объявления не найдены" style={{ margin: '32px 0' }} />
          )}

          {!error && ads.length > 0 && (
            <>
              <div className={styles.bulkToolbar}>
                <Space wrap>
                  <Text>Выбрано:</Text>
                  <Text
                    strong
                    style={{
                      display: 'inline-block',
                      width: 15,
                      textAlign: 'left',
                    }}
                  >
                    {selectedIds.length}
                  </Text>
                  <Button onClick={selectAllOnPage} disabled={ads.length === 0}>
                    Выбрать все на странице
                  </Button>
                  <Button
                    onClick={clearSelection}
                    disabled={selectedIds.length === 0}
                  >
                    Снять выбор
                  </Button>
                </Space>

                <Space wrap>
                  <Button
                    type="primary"
                    disabled={selectedIds.length === 0}
                    onClick={openBulkApproveModal}
                  >
                    Одобрить
                  </Button>
                  <Button
                    danger
                    type="primary"
                    disabled={selectedIds.length === 0}
                    onClick={openBulkRejectModal}
                  >
                    Отклонить
                  </Button>
                </Space>
              </div>

              <Row gutter={[16, 16]}>
                {ads.map((ad) => (
                  <Col key={ad.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Link to={`/item/${ad.id}`}>
                      <ProductCard
                        image={ad.images?.[0] ?? ''}
                        title={ad.title}
                        price={ad.price}
                        category={ad.category}
                        createdAt={ad.createdAt}
                        status={ad.status}
                        priority={ad.priority}
                        showCheckbox
                        checked={selectedIds.includes(ad.id)}
                        onToggleCheckbox={() => toggleSelect(ad.id)}
                      />
                    </Link>
                  </Col>
                ))}
              </Row>

              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <Pagination
                  current={page}
                  total={totalItems}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  disabled={loading}
                />
                <Text type="secondary">
                  Страница {page} из {totalPages}
                </Text>
              </div>
            </>
          )}
        </Spin>
      </Card>

      <ModalWindow
        open={bulkModalOpen}
        mode={bulkMode}
        selectedIds={selectedIds}
        onClose={handleBulkClose}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
};

export default List;
