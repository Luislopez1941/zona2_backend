import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { promociones_TipoPromo, promociones_Estatus } from '@prisma/client';

export class CreatePromocioneDto {
  @ApiProperty({ description: 'ID del organizador' })
  @IsNumber()
  OrgID: number;

  @ApiProperty({ description: 'Título de la promoción' })
  @IsString()
  Titulo: string;

  @ApiProperty({ description: 'Subtítulo de la promoción' })
  @IsString()
  Subtitulo: string;

  @ApiPropertyOptional({ description: 'Imagen de la promoción (base64)' })
  @IsOptional()
  Imagen?: any;

  @ApiProperty({ description: 'Precio de la promoción' })
  @IsNumber()
  Precio: number;

  @ApiPropertyOptional({ description: 'Moneda', default: 'MXN' })
  @IsOptional()
  @IsString()
  Moneda?: string;

  @ApiProperty({ description: 'Máximo de puntos Z2' })
  @IsNumber()
  MaxPuntosZ2: number;

  @ApiProperty({ description: 'Importe de descuento' })
  @IsNumber()
  DescuentoImporte: number;

  @ApiPropertyOptional({ description: 'Tipo de promoción', enum: promociones_TipoPromo })
  @IsOptional()
  @IsEnum(promociones_TipoPromo)
  TipoPromo?: promociones_TipoPromo;

  @ApiPropertyOptional({ description: 'QR único de la promoción' })
  @IsOptional()
  @IsString()
  QRUnico?: string;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsDateString()
  FechaInicio: string;

  @ApiProperty({ description: 'Fecha de fin (YYYY-MM-DD)' })
  @IsDateString()
  FechaFin: string;

  @ApiPropertyOptional({ description: 'Estatus de la promoción', enum: promociones_Estatus })
  @IsOptional()
  @IsEnum(promociones_Estatus)
  Estatus?: promociones_Estatus;
}
