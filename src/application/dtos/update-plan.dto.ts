export interface UpdatePlanDto {
  planId: string;
  name?: string;
  price?: number;
  currency?: string;
  interval?: 'month' | 'year';
  features?: string[];
}
