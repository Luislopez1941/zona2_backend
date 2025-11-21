import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLoginDto {
  @IsString()
  @IsOptional()
  phone?: string; // Número telefónico (opcional si se envía login)

  @IsString()
  @IsOptional()
  login?: string; // Login (puede ser el número telefónico)

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  code?: string; // Código 2FA (opcional si el usuario tiene MFA configurado)
}
