import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailChangeHttpDto {
  @ApiProperty({ description: 'Token recibido por email', example: '3f9a1c7e8b2d4f6a0c1e5d7b9a3f2e1c' })
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;
}
