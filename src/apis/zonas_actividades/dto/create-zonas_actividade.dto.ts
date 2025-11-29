import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateZonasActividadeDto {
  @IsString()
  @IsNotEmpty()
  RunnerUIDRef: string; // Usuario que da las zonas

  @IsNumber()
  @IsNotEmpty()
  actID: number; // ID de la actividad a la que se le dan las zonas

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  puntos: number; // Cantidad de puntos a otorgar
}
