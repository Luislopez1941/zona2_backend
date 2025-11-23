import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateOrganizadorDto {
  // Aceptar nombreComercial del frontend (camelCase)
  @IsString()
  nombreComercial: string;

  // Aceptar razonSocial del frontend (camelCase, opcional)
  @IsOptional()
  @IsString()
  razonSocial?: string;

  // nombreCompleto - opcional, se usará nombreComercial como fallback en el servicio
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  // Aceptar correoElectronico del frontend
  @IsEmail()
  correoElectronico: string;

  // Aceptar celular del frontend
  @IsString()
  celular: string;
}

