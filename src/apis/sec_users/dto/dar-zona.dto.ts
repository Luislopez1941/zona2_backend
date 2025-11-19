import { IsString, IsNotEmpty } from 'class-validator';

export class DarZonaDto {
  @IsString()
  @IsNotEmpty()
  runnerUIDA: string; // Quien otorga

  @IsString()
  @IsNotEmpty()
  runnerUID: string; // Quien recibe
}

