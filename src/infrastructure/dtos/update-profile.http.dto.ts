import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileHttpDto {
  @ApiProperty({ description: 'Nombre completo del usuario', minLength: 2, maxLength: 100, example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;
}
