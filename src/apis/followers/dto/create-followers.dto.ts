import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFollowerDto {
  @IsString()
  @IsNotEmpty()
  followed_runnerUID: string; // El RunnerUID de la persona que quiero seguir
}
