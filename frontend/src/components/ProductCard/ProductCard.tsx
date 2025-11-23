import React from 'react';
import { Card, Typography, Tag, Checkbox } from 'antd';
import type { ProductCardProps } from '../../types/product_card.types';
import { formatDate, formatPrice, getPriorityStyles, getStatusStyles, priorityTextMap, statusTextMap } from './ProductCardUtils';
import styles from './ProductCard.module.css';

const { Paragraph, Text } = Typography;

const ProductCard: React.FC<ProductCardProps> = ({ image, title, price, category, createdAt, status, priority, showCheckbox, checked, onToggleCheckbox }) => {
  const statusText = statusTextMap[status];
  const priorityText = priorityTextMap[priority];

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showCheckbox) return;
    e.preventDefault();    
    e.stopPropagation();
    onToggleCheckbox?.();
  };

  return (
    <Card
      hoverable
      className={styles.card}
      cover={
        <div className={styles.imageContainer}>
          {(showCheckbox || priority === 'urgent') && (
            <div
              className={`${styles.selectBar} ${
                showCheckbox ? styles.selectBarClickable : ''
              }`}
              onClick={handleBarClick}
            >
              {showCheckbox && (
                <Checkbox
                  className={styles.selectCheckbox}
                  checked={checked}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleCheckbox?.();
                  }}
                />
              )}

              {priority === 'urgent' && (
                <Tag className={styles.urgentTag}>Срочное</Tag>
              )}
            </div>
          )}

          <img
            src={image}
            alt={title}
            loading="lazy"
            className={styles.image}
          />
        </div>
      }
    >
      <Paragraph className={styles.title}>{title}</Paragraph>

      <Text strong className={styles.price}>
        {formatPrice(price)}
      </Text>

      <div className={styles.metaInfo}>
        <span className={styles.category}>{category}</span>
        <span className={styles.separator}>|</span>
        <span className={styles.date}>от {formatDate(createdAt)}</span>
      </div>

      <div className={styles.footer}>
        <span className={styles.statusBadge} style={getStatusStyles(status)}>
          {statusText}
        </span>
        <span
          className={styles.priorityBadge}
          style={getPriorityStyles(priority)}
        >
          {priorityText}
        </span>
      </div>
    </Card>
  );
};

export default ProductCard;
