import { IsString, IsOptional } from 'class-validator';

export class ForgetPasswordDto {
  @IsString()
  @IsOptional()
  phone?: string; // Número telefónico

  @IsString()
  @IsOptional()
  login?: string; // Login (puede ser el número telefónico)

  @IsString()
  @IsOptional()
  password?: string; // Opcional, no se usa pero se permite para compatibilidad
}

