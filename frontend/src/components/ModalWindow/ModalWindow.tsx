import React, { useEffect, useState } from 'react';
import { Modal, Radio, Input, Alert, Space, Typography } from 'antd';

import { REJECTION_REASONS } from '../../pages/Item/ItemUtils';
import type { ModalWindowProps } from '../../types/modal_window.types';
import type { RejectionReason } from '../../types/Item.types';

const { TextArea } = Input;
const { Text } = Typography;

const API_URL_BACK =
  import.meta.env.VITE_API_URL_BACK ?? 'http://localhost:3001';

export const ModalWindow: React.FC<ModalWindowProps> = ({
  open,
  mode,
  selectedIds,
  onClose,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] =
    useState<RejectionReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [comment, setComment] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setCustomReason('');
      setComment('');
      setReasonError(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const getFinalReason = (): string | null => {
    if (mode !== 'reject') return null;
    if (selectedReason === 'Другое') {
      const trimmed = customReason.trim();
      return trimmed || null;
    }
    return selectedReason;
  };

  const handleSubmit = async () => {
    if (!selectedIds.length || !mode) return;

    if (mode === 'reject') {
      const reason = getFinalReason();
      if (!reason) {
        setReasonError('Необходимо указать причину');
        return;
      }
      setReasonError(null);
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === 'approve') {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`${API_URL_BACK}/api/v1/ads/${id}/approve`, {
              method: 'POST',
            }),
          ),
        );
      } else {
        const reason = getFinalReason();
        const body = JSON.stringify({
          reason,
          comment: comment.trim() || undefined,
        });

        await Promise.all(
          selectedIds.map((id) =>
            fetch(`${API_URL_BACK}/api/v1/ads/${id}/reject`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body,
            }),
          ),
        );
      }

      onSuccess(); 
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Неизвестная ошибка при обновлении',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === 'approve' ? 'Одобрить' : 'Отклонить'}
      confirmLoading={loading}
      title={
        mode === 'approve'
          ? 'Подтвердить одобрение'
          : 'Укажите причину отклонения'
      }
    >
      {mode === 'approve' ? (
        <Text>Одобрить объявления ({selectedIds.length} шт.)?</Text>
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}

          <div>
            <Text strong>Причина *</Text>
            <Radio.Group
              onChange={(e) =>
                setSelectedReason(e.target.value as RejectionReason)
              }
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

            {reasonError && (
              <div style={{ marginTop: 8 }}>
                <Text type="danger">{reasonError}</Text>
              </div>
            )}
          </div>

          <div style={{ width: '100%' }}>
            <Text strong>Комментарий</Text>
            <TextArea
              rows={3}
              style={{ marginTop: 8 }}
              placeholder="Добавьте комментарий (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </Space>
      )}
    </Modal>
  );
};
