import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength, MaxLength } from 'class-validator';
import { ContactMessageType } from '@domain/entities/contact-message.entity';

export class CreateContactMessageHttpDto {
  @ApiProperty({ enum: ['comment', 'request'], example: 'comment' })
  @IsIn(['comment', 'request'], { message: 'El tipo debe ser comment o request' })
  type: ContactMessageType;

  @ApiProperty({ minLength: 3, maxLength: 150, example: 'Sugerencia sobre el panel' })
  @IsString()
  @MinLength(3, { message: 'El asunto debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El asunto no puede superar los 150 caracteres' })
  subject: string;

  @ApiProperty({
    minLength: 10,
    maxLength: 2000,
    example: 'Sería útil poder exportar la lista de planes a CSV.',
  })
  @IsString()
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres' })
  message: string;
}
