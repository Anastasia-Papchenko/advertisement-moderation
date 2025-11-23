import type { AdCardProps } from "./product_card.types";

export type ApiAd = {
  id: number;
  title: string;
  price: number;
  category: string;
  categoryId: number;
  createdAt: string;
  status: AdCardProps['status'];
  priority: AdCardProps['priority'];
  images: string[];
};

export type AdsResponse = {
  ads: ApiAd[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export type CategoryOption = {
  id: number;
  name: string;
};