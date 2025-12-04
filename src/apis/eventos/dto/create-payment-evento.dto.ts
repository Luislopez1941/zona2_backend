import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentEventoDto {
  @ApiProperty({ description: 'UID del corredor que pagará el evento' })
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @ApiProperty({ description: 'ID del evento a pagar' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  EventoID: number;

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

