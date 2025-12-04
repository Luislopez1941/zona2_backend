import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentPromocionDto {
  @ApiProperty({ description: 'UID del corredor que pagará la promoción' })
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @ApiProperty({ description: 'ID de la promoción a pagar' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  PromoID: number;

  @ApiProperty({ description: 'Monto a pagar en centavos (ej: 50000 = $500.00 MXN)', example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Moneda (default: MXN)' })
  @IsOptional()
  @IsString()
  currency?: string;
}

