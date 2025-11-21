import { IsString, IsOptional, ValidateIf } from 'class-validator';

export class LoginValidationDto {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.login)
  phone?: string; // Número telefónico

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.phone)
  login?: string; // Login (puede ser el número telefónico)

  @IsString()
  @IsOptional()
  password?: string; // Contraseña (opcional, para validar antes de enviar OTP)
}

