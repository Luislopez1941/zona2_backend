import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCiudadesMexicoDto {
  @IsString()
  @IsNotEmpty()
  Estado: string;

  @IsString()
  @IsNotEmpty()
  Ciudad: string;
}
