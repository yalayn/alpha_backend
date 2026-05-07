import { IsString } from 'class-validator';

export class SubscribeCustomerHttpDto {
  @IsString()
  customerId: string;

  @IsString()
  planId: string;

  @IsString()
  paymentMethodId: string;
}
