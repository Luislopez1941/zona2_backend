import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyRecoveryCodeDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // Número telefónico

  @IsString()
  @IsNotEmpty()
  code: string; // Código de recuperación
}

