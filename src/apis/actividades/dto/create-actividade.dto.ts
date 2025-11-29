import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsBoolean, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class RutaPuntoDto {
  @IsOptional()
  @IsNumber()
  punto_numero?: number;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}

export class UbicacionDto {
  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsNumber()
  inicio_lat?: number;

  @IsOptional()
  @IsNumber()
  inicio_lon?: number;

  @IsOptional()
  @IsNumber()
  fin_lat?: number;

  @IsOptional()
  @IsNumber()
  fin_lon?: number;
}

export class ZonaDto {
  @IsOptional()
  @IsNumber()
  zona_numero?: number;

  @IsOptional()
  @IsString()
  rango_texto?: string;

  @IsOptional()
  @IsBoolean()
  fue_activa?: boolean;
}

export class CreateActividadeDto {
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1, { message: 'plataforma debe ser un solo carácter: S (Strava), G (Garmin), M (Manual)' })
  @Matches(/^[SGM]$/, { message: 'plataforma debe ser S, G o M' })
  plataforma: string; // 'S' para Strava, 'G' para Garmin, 'M' para Manual

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsDateString()
  @IsNotEmpty()
  fechaActividad: string; // ISO 8601 format: "2024-12-15T06:00:00Z"

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  DistanciaKM: number;

  @IsString()
  @IsNotEmpty()
  RitmoMinKm: string; // Formato: "5:30"

  @IsString()
  @IsNotEmpty()
  Duracion: string; // Formato: "30:15" o "1:30:15"

  @IsString()
  @IsNotEmpty()
  Origen: string; // Ejemplo: "Strava", "Garmin", "Manual"

  @IsString()
  @IsNotEmpty()
  Ciudad: string;

  @IsString()
  @IsNotEmpty()
  Pais: string;

  @IsString()
  @IsNotEmpty()
  enlace: string; // URL de la actividad en la plataforma

  // Campos opcionales de la tabla actividades
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  duracion_segundos?: number;

  @IsOptional()
  @IsString()
  duracion_formateada?: string;

  @IsOptional()
  @IsNumber()
  distancia?: number;

  @IsOptional()
  @IsString()
  ritmo?: string;

  @IsOptional()
  @IsNumber()
  frecuencia_promedio?: number;

  @IsOptional()
  @IsNumber()
  frecuencia_maxima?: number;

  @IsOptional()
  @IsNumber()
  cadencia?: number;

  @IsOptional()
  @IsNumber()
  calorias?: number;

  @IsOptional()
  @IsNumber()
  zona_activa?: number;

  @IsOptional()
  @IsString()
  tipo_actividad?: string;

  // Tablas relacionadas
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RutaPuntoDto)
  ruta?: RutaPuntoDto[]; // Array de puntos GPS de la ruta

  @IsOptional()
  @ValidateNested()
  @Type(() => UbicacionDto)
  ubicacion?: UbicacionDto; // Ubicación de inicio y fin

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZonaDto)
  zonas?: ZonaDto[]; // Array de zonas relacionadas
}
