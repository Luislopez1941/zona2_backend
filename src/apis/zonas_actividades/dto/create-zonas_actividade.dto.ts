import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateZonasActividadeDto {
  @IsString()
  @IsNotEmpty()
  RunnerUIDRef: string; // Usuario que da las zonas

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  actID: number; // ID de la actividad a la que se le dan las zonas

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  puntos: number; // Cantidad de puntos a otorgar
}
