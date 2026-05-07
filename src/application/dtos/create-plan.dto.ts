export interface CreatePlanDto {
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}
