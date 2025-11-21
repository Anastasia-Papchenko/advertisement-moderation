// /api/v1/stats/summary
export type StatsSummary = {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number; // секунды
};

// /api/v1/stats/chart/activity
export type ActivityPoint = {
  date: string; // YYYY-MM-DD
  approved: number;
  rejected: number;
  requestChanges: number;
};

// /api/v1/stats/chart/decisions
export type DecisionsDistribution = {
  approved: number;
  rejected: number;
  requestChanges: number;
};

// /api/v1/stats/chart/categories
export type CategoriesChart = Record<string, number>;