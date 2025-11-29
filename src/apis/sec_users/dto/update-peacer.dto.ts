import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UpdatePeacerDto {
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @IsOptional()
  @IsDateString()
  FechaRenovacionMembresia?: string;
}

