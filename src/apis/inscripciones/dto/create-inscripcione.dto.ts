import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsEmail, Min, Max } from 'class-validator';

export enum TallaPlayera {
  ExtraChica = 'ExtraChica',
  Chica = 'Chica',
  Mediana = 'Mediana',
  Grande = 'Grande',
  ExtraGrande = 'ExtraGrande',
}

export class CreateInscripcioneDto {
  @IsNumber()
  EventoID: number;

  @IsString()
  RunnerUID: string;

  @IsOptional()
  @IsString()
  RunnerNombre?: string;

  @IsOptional()
  @IsEmail()
  RunnerEmail?: string;

  @IsOptional()
  @IsString()
  RunnerTelefono?: string;

  @IsOptional()
  @IsString()
  Genero?: string;

  @IsOptional()
  @IsDateString()
  FechaNacimiento?: string;

  @IsOptional()
  @IsEnum(TallaPlayera)
  TallaPlayera?: TallaPlayera;

  @IsOptional()
  @IsString()
  EquipoID?: string;

  @IsString()
  DistanciaElegida: string;

  @IsOptional()
  @IsString()
  CategoriaElegida?: string;

  @IsOptional()
  @IsString()
  Disciplina?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  PuntosUsados?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  DescuentoAplicadoMXN?: number;

  @IsOptional()
  @IsString()
  MetodoPago?: string;

  @IsOptional()
  @IsString()
  PagoTransaccionID?: string;

  @IsOptional()
  @IsString()
  ContactoEmergencia?: string;

  @IsOptional()
  @IsString()
  TelefonoEmergencia?: string;

  @IsOptional()
  @IsString()
  Ciudad?: string;

  @IsOptional()
  @IsString()
  Estado?: string;

  @IsOptional()
  @IsString()
  Pais?: string;
}
