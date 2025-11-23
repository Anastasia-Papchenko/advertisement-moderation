import type { REJECTION_REASONS } from "../pages/Item/ItemUtils";
import type { AdCardProps } from "./product_card.types";

export type RejectionReason = (typeof REJECTION_REASONS)[number];

export type HistoryRow = AdDetails['moderationHistory'][number];

export type AdStatus = AdCardProps['status'];
export type AdPriority = AdCardProps['priority'];

export type Seller = {
  id: number;
  name: string;
  rating: string;       
  totalAds: number;
  registeredAt: string; 
};

export type Characteristics = Record<string, string>;

export type ModerationAction = 'pending' | 'approved' | 'rejected' | 'requestChanges';

export type ModerationHistoryEntry = {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: ModerationAction;
  reason: string | null;
  comment: string;
  timestamp: string; 
};

export type AdDetails = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: AdStatus;
  priority: AdPriority;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: Seller;
  characteristics: Characteristics;
  moderationHistory: ModerationHistoryEntry[];
};
