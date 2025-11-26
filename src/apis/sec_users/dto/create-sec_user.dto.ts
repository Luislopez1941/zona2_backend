import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSecUserDto {
  @IsOptional()
  @IsString()
  RunnerUID?: string;

  @IsOptional()
  @IsString()
  RunnerUIDRef?: string;

  @IsOptional()
  @IsString()
  AliasRunner?: string;

  @IsOptional()
  @IsString()
  DisciplinaPrincipal?: string;

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
  RFC?: string;

  @IsOptional()
  @IsString()
  TipoMembresia?: string;

  @IsOptional()
  @IsDateString()
  FechaUltimaActividad?: string;

  @IsOptional()
  @IsNumber()
  InvitacionesTotales?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  SuscripcionMXN?: number;

  @IsOptional()
  @IsNumber()
  WalletPuntos?: number;

  @IsOptional()
  @IsNumber()
  WalletPuntosI?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  WalletSaldoMXN?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  GananciasAcumuladasMXN?: number;

  @IsOptional()
  @IsNumber()
  InvitacionesMensuales?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  PorcentajeCumplimiento?: number;

  @IsOptional()
  @IsString()
  NivelRunner?: string;

  @IsOptional()
  @IsDateString()
  FechaRenovacionMembresia?: string;

  @IsOptional()
  @IsBoolean()
  CFDIEmitido?: boolean;

  @IsOptional()
  @IsString()
  StravaAthleteID?: string;

  @IsOptional()
  @IsString()
  GarminUserID?: string;

  @IsOptional()
  @IsString()
  Z2TotalHistorico?: string;

  @IsOptional()
  @IsNumber()
  Z2Recibidas30d?: number;

  @IsOptional()
  @IsNumber()
  Z2Otorgadas30d?: number;

  @IsOptional()
  @IsNumber()
  Actividades30d?: number;

  @IsOptional()
  @IsString()
  NivelMensual?: string;

  @IsOptional()
  @IsDateString()
  FechaUltimaZ2?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  Genero?: string;

  @IsOptional()
  @IsString()
  Peso?: string;

  @IsOptional()
  @IsString()
  Estatura?: string;

  @IsOptional()
  @IsString()
  Ciudad?: string;

  @IsOptional()
  @IsString()
  Estado?: string;

  @IsOptional()
  @IsString()
  Pais?: string;

  @IsOptional()
  @IsString()
  EmergenciaContacto?: string;

  @IsOptional()
  @IsString()
  EmergenciaCelular?: string;

  @IsOptional()
  @IsString()
  EmergenciaParentesco?: string;

  @IsOptional()
  @IsString()
  equipoID?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  activation_code?: string;

  @IsOptional()
  @IsString()
  priv_admin?: string;

  @IsOptional()
  @IsString()
  mfa?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  picture?: any;
}
