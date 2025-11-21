import { IsString, IsNotEmpty } from 'class-validator';

export class SetupMfaDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // Número telefónico del usuario
}

