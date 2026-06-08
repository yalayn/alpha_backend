import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanHttpDto {
  @ApiProperty({ description: 'ID del nuevo plan', example: 'clx9z8y7x6w5v4u3t2s1r0q' })
  @IsString()
  @IsNotEmpty()
  newPlanId: string;

  @ApiProperty({ description: 'ID del método de pago (solo se cobra en cambios immediate)', example: 'pm_stripe_xyz789' })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
