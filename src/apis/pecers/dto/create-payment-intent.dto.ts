import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'UID del corredor que se convertirá en pacer' })
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @ApiProperty({ description: 'Monto a pagar en MXN (centavos)', example: 50000 })
  @IsNumber()
  @Min(1)
  amount: number; // En centavos (50000 = $500.00 MXN)

  @ApiPropertyOptional({ description: 'Moneda (default: MXN)' })
  @IsOptional()
  @IsString()
  currency?: string; // Default: 'mxn'
}

