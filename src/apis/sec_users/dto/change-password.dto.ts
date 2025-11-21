import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsOptional()
  phone?: string; // Número telefónico (opcional si se envía login)

  @IsString()
  @IsOptional()
  login?: string; // Login (puede ser el número telefónico)

  @IsString()
  @IsNotEmpty()
  password: string; // Nueva contraseña (el frontend envía password, no newPassword)

  @IsString()
  @IsOptional()
  code?: string; // Código de recuperación (opcional, se valida en el controlador)
}

