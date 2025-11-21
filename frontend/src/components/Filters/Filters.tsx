import React from 'react';
import { Card, Row, Col, Checkbox, Select, Input, InputNumber, Button, Space, Divider, Typography, } from 'antd';
import { FilterOutlined, SearchOutlined, ReloadOutlined, } from '@ant-design/icons';
import type { FiltersProps, FiltersState, SortBy, SortOrder, StatusFilter, } from '../../types/filters.types';
import { statusOptions } from './FiltersUtils';

const { Option } = Select;
const { Title } = Typography;

export const FiltersInner: React.FC<FiltersProps> = ({ statuses, categoryId, minPrice, maxPrice, search, sortBy, sortOrder, categories, onChange, onReset, }) => {
  const update = (patch: Partial<FiltersState>) => {
    onChange({ statuses, categoryId, minPrice, maxPrice, search, sortBy, sortOrder, ...patch, });
  };

  const handleCategoryChange = (value: string) => {
    update({
      categoryId: value === '' ? null : Number.parseInt(value, 10),
    });
  };

  const handleMinPriceChange = (value: number | null) => {
    update({ minPrice: value?.toString() || '' });
  };

  const handleMaxPriceChange = (value: number | null) => {
    update({ maxPrice: value?.toString() || '' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ search: e.target.value });
  };

  const handleSortByChange = (value: SortBy) => {
    update({ sortBy: value });
  };

  const handleSortOrderChange = (value: SortOrder) => {
    update({ sortOrder: value });
  };

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          Фильтры и сортировка
        </Space>
      }
      style={{ marginBottom: 16 }}
      extra={
        <Button
          type="default"
          onClick={onReset}
        >
          <ReloadOutlined />
          Сбросить
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                Статус
              </Title>
              <Checkbox.Group
                value={statuses}
                onChange={(values) =>
                  update({ statuses: values as StatusFilter[] })
                }
                style={{ width: '100%' }}
              >
                <Row gutter={[8, 8]}>
                  {statusOptions.map((opt) => (
                    <Col key={opt.value}>
                      <Checkbox
                        value={opt.value}
                      >
                        {opt.label}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  Категория
                </Title>
                <Select
                  placeholder="Все категории"
                  style={{ width: '100%' }}
                  value={categoryId ? categoryId.toString() : undefined}
                  onChange={handleCategoryChange}
                  allowClear
                >
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  Поиск по названию
                </Title>
                <Input
                  placeholder="Введите название объявления"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={handleSearchChange}
                />
              </Col>
            </Row>

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                Цена
              </Title>
              <Space>
                <InputNumber
                  placeholder="от"
                  min={0}
                  value={minPrice ? Number(minPrice) : undefined}
                  onChange={handleMinPriceChange}
                  style={{ width: 100 }}
                />
                <span>-</span>
                <InputNumber
                  placeholder="до"
                  min={0}
                  value={maxPrice ? Number(maxPrice) : undefined}
                  onChange={handleMaxPriceChange}
                  style={{ width: 100 }}
                />
              </Space>
            </div>
          </Space>
        </Col>

        <Col xs={24} lg={1}>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>

        <Col xs={24} lg={7}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Title level={5}>Сортировка</Title>

            <div>
              <div style={{ marginBottom: 8 }}>Сортировать по:</div>
              <Select
                style={{ width: '100%' }}
                value={sortBy}
                onChange={handleSortByChange}
              >
                <Option value="createdAt">По дате создания</Option>
                <Option value="price">По цене</Option>
                <Option value="priority">По приоритету</Option>
              </Select>
            </div>

            <div>
              <div style={{ marginBottom: 8 }}>Порядок:</div>
              <Select
                style={{ width: '100%' }}
                value={sortOrder}
                onChange={handleSortOrderChange}
              >
                <Option value="desc">
                  По убыванию (новые/дороже/срочнее)
                </Option>
                <Option value="asc">
                  По возрастанию (старые/дешевле/обычный)
                </Option>
              </Select>
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export const Filters = React.memo(FiltersInner);
export default Filters;
