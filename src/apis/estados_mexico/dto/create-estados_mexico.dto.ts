import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEstadosMexicoDto {
  @IsString()
  @IsNotEmpty()
  Nombre: string;
}
