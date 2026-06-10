import { IsString, IsNumber, IsArray, IsEnum, IsOptional, MinLength, MaxLength, Min, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlanHttpDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre del plan', example: 'Pro Plus' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Nuevo precio', example: 39.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Moneda (ISO 4217)', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Intervalo de facturación', enum: ['month', 'year'], example: 'year' })
  @IsOptional()
  @IsEnum(['month', 'year'])
  interval?: 'month' | 'year';

  @ApiPropertyOptional({ description: 'Lista de funcionalidades incluidas', example: ['video-hd', 'export-pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  features?: string[];
}
