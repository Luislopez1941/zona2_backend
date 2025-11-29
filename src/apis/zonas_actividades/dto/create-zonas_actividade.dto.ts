import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateZonasActividadeDto {
  @Expose()
  @ApiProperty({ description: 'RunnerUID del usuario que da las zonas' })
  @IsString()
  @IsNotEmpty()
  RunnerUIDRef: string; // Usuario que da las zonas

  @Expose()
  @ApiProperty({ description: 'ID de la actividad a la que se le dan las zonas' })
  @IsNumber()
  @IsNotEmpty()
  actID: number; // ID de la actividad a la que se le dan las zonas

  @Expose()
  @ApiProperty({ description: 'Cantidad de puntos a otorgar', minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  puntos: number; // Cantidad de puntos a otorgar
}
