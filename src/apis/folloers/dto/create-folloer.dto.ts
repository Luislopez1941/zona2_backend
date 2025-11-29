import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFolloerDto {
  @IsString()
  @IsNotEmpty()
  followed_runnerUID: string; // El RunnerUID de la persona que quiero seguir
}
