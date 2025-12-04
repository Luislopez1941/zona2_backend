import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreatePecerDto {
  @ApiProperty({ description: 'UID del corredor que se convertirá en pacer' })
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @ApiPropertyOptional({ description: 'Alias del pacer' })
  @IsOptional()
  @IsString()
  AliasPacer?: string;

  @ApiPropertyOptional({ description: 'Biografía del pacer' })
  @IsOptional()
  @IsString()
  Biografia?: string;

  @ApiPropertyOptional({ description: 'Idiomas que habla el pacer' })
  @IsOptional()
  @IsString()
  Idiomas?: string;

  @ApiPropertyOptional({ description: 'Ritmo mínimo por kilómetro (ej: "5:30")' })
  @IsOptional()
  @IsString()
  RitmoMin?: string;

  @ApiPropertyOptional({ description: 'Distancias que domina (ej: "5K, 10K, 21K")' })
  @IsOptional()
  @IsString()
  DistanciasDominadas?: string;

  @ApiPropertyOptional({ description: 'Certificaciones del pacer' })
  @IsOptional()
  @IsString()
  Certificaciones?: string;

  @ApiPropertyOptional({ description: 'Ciudad base del pacer (se obtiene del usuario si no se proporciona)' })
  @IsOptional()
  @IsString()
  CiudadBase?: string;

  @ApiPropertyOptional({ description: 'Estado base del pacer (se obtiene del usuario si no se proporciona)' })
  @IsOptional()
  @IsString()
  EstadoBase?: string;

  @ApiPropertyOptional({ description: 'País base del pacer (se obtiene del usuario si no se proporciona)' })
  @IsOptional()
  @IsString()
  PaisBase?: string;

  @ApiPropertyOptional({ description: 'Disponibilidad horaria del pacer' })
  @IsOptional()
  @IsString()
  DisponibilidadHoraria?: string;

  @ApiPropertyOptional({ description: 'Si ofrece servicio de pick up en hotel' })
  @IsOptional()
  @IsBoolean()
  PickUpHotel?: boolean;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  FotoPerfilURL?: string;

  @ApiPropertyOptional({ description: 'Redes sociales del pacer' })
  @IsOptional()
  @IsString()
  RedesSociales?: string;

  @ApiPropertyOptional({ description: 'Tarifa base del pacer en MXN' })
  @IsOptional()
  @IsNumber()
  Tarifabase?: number;
}
