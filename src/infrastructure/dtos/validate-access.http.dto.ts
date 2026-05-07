import { IsString } from 'class-validator';

export class ValidateAccessHttpDto {
  @IsString()
  customerId: string;

  @IsString()
  featureId: string;
}
