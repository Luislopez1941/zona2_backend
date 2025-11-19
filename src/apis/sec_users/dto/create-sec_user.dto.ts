import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateSecUserDto {
  @IsString()
  name: string;

  @IsString()
  login: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  pswd?: string;

  @IsOptional()
  @IsString()
  RunnerUIDRef?: string;

  @IsOptional()
  @IsString()
  AliasRunner?: string;

  @IsOptional()
  @IsString()
  RFC?: string;

  @IsOptional()
  @IsString()
  Ciudad?: string;

  @IsOptional()
  @IsString()
  Pais?: string;

  @IsOptional()
  @IsString()
  TipoMembresia?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  Genero?: string;

  @IsOptional()
  @IsString()
  equipoID?: string;
}
