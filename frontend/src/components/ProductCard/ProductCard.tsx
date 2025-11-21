import React from 'react';
import { Card, Typography, Tag } from 'antd';
import type { AdCardProps } from '../../types/productcard.types';
import { formatDate, formatPrice, getPriorityStyles, getStatusStyles, priorityTextMap, statusTextMap } from './ProductCardUtils';
import styles from './ProductCard.module.css';

const { Paragraph, Text } = Typography;

const ProductCard: React.FC<AdCardProps> = ({ image, title, price, category, createdAt, status, priority }) => {
  const statusText = statusTextMap[status];
  const priorityText = priorityTextMap[priority];

  return (
    <Card
      hoverable
      className={styles.card}
      cover={
        <div className={styles.imageContainer}>
          <img src={image} alt={title} loading="lazy" className={styles.image} />

          {priority === 'urgent' && (
            <Tag className={styles.urgentTag}>Срочное</Tag>
          )}
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
        <span className={styles.priorityBadge} style={getPriorityStyles(priority)}>
          {priorityText}
        </span>
      </div>
    </Card>

  );
};

export default ProductCard;