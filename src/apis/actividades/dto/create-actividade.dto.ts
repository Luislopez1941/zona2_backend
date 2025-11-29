import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateActividadeDto {
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @IsString()
  @IsNotEmpty()
  plataforma: string; // 'S' para Strava, 'G' para Garmin, etc.

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
}
