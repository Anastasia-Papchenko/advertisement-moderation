export type BulkMode = 'approve' | 'reject' | null;

export type ModalWindowProps = {
  open: boolean;
  mode: BulkMode;
  selectedIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}