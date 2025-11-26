import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateEventoDto {
  @ApiProperty({ description: 'ID del organizador' })
  @IsNumber()
  OrgID: number;

  @ApiProperty({ description: 'Título del evento' })
  @IsString()
  Titulo: string;

  @ApiPropertyOptional({ description: 'Subtítulo del evento' })
  @IsOptional()
  @IsString()
  Subtitulo?: string;

  @ApiPropertyOptional({ description: 'Tipo de evento', default: 'Carrera' })
  @IsOptional()
  @IsString()
  TipoEvento?: string;

  @ApiPropertyOptional({ description: 'Distancias disponibles' })
  @IsOptional()
  @IsString()
  Distancias?: string;

  @ApiPropertyOptional({ description: 'Categorías del evento' })
  @IsOptional()
  @IsString()
  Categorias?: string;

  @ApiProperty({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsDateString()
  FechaEvento: string;

  @ApiProperty({ description: 'Hora del evento (HH:mm:ss)' })
  @IsString()
  HoraEvento: string;

  @ApiPropertyOptional({ description: 'Ciudad del evento' })
  @IsOptional()
  @IsString()
  Ciudad?: string;

  @ApiPropertyOptional({ description: 'Estado del evento' })
  @IsOptional()
  @IsString()
  Estado?: string;

  @ApiPropertyOptional({ description: 'País del evento' })
  @IsOptional()
  @IsString()
  Pais?: string;

  @ApiPropertyOptional({ description: 'Lugar del evento' })
  @IsOptional()
  @IsString()
  Lugar?: string;

  @ApiPropertyOptional({ description: 'URL del mapa' })
  @IsOptional()
  @IsString()
  UrlMapa?: string;

  @ApiPropertyOptional({ description: 'URL del calendario' })
  @IsOptional()
  @IsString()
  UrlCalendario?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen' })
  @IsOptional()
  @IsString()
  UrlImagen?: string;

  @ApiPropertyOptional({ description: 'URL de registro' })
  @IsOptional()
  @IsString()
  UrlRegistro?: string;

  @ApiPropertyOptional({ description: 'URL de pago directo' })
  @IsOptional()
  @IsString()
  UrlPagoDirecto?: string;

  @ApiPropertyOptional({ description: 'Máximo de puntos Z2' })
  @IsOptional()
  @IsNumber()
  MaxPuntosZ2?: number;

  @ApiPropertyOptional({ description: 'Máximo descuento Z2' })
  @IsOptional()
  @IsNumber()
  MaxDescuentoZ2?: number;

  @ApiPropertyOptional({ description: 'Equivalencia de puntos' })
  @IsOptional()
  @IsNumber()
  PuntosEquivalencia?: number;

  @ApiPropertyOptional({ description: 'Importe de descuento' })
  @IsOptional()
  @IsNumber()
  DescuentoImporte?: number;

  @ApiPropertyOptional({ description: 'Contenido editable carta de exoneración' })
  @IsOptional()
  @IsString()
  editCartaExoneracion?: string;

  @ApiPropertyOptional({ description: 'URL carta de exoneración' })
  @IsOptional()
  @IsString()
  UrlCartaExoneracion?: string;

  @ApiPropertyOptional({ description: 'Contenido editable guía del espectador' })
  @IsOptional()
  @IsString()
  editGuiaExpectador?: string;

  @ApiPropertyOptional({ description: 'URL guía del espectador' })
  @IsOptional()
  @IsString()
  GuiaExpectador?: string;

  @ApiPropertyOptional({ description: 'Precio del evento' })
  @IsOptional()
  @IsNumber()
  PrecioEvento?: number;

  @ApiPropertyOptional({ description: 'Moneda', default: 'MXN' })
  @IsOptional()
  @IsString()
  Moneda?: string;

  @ApiPropertyOptional({ description: 'Estatus del evento (borrador, publicado, cerrado, cancelado)' })
  @IsOptional()
  @IsString()
  Estatus?: string;
}
