import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestEmailChangeHttpDto {
  @ApiProperty({ description: 'Nuevo email solicitado', example: 'new.address@example.com' })
  @IsEmail({}, { message: 'El formato del email es inválido' })
  newEmail: string;
}
