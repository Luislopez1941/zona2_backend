import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class LoginOtpDto {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.login)
  phone?: string; // Número telefónico

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.phone)
  login?: string; // Login (puede ser el número telefónico)

  @IsString()
  @IsNotEmpty()
  code: string; // Código OTP recibido por SMS
}

