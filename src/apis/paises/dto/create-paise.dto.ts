import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreatePaiseDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  CodigoISO: string;

  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  Telefono: string;
}
