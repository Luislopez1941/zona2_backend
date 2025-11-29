import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaiseDto {
  @IsString()
  @IsNotEmpty()
  Nombre: string;
}
