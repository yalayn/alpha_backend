import { IsString, IsNumber, IsArray, IsEnum } from 'class-validator';

export class CreatePlanHttpDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsEnum(['month', 'year'])
  interval: 'month' | 'year';

  @IsArray()
  @IsString({ each: true })
  features: string[];
}
