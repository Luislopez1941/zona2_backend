import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificacioneDto {
  @IsString()
  @IsNotEmpty()
  toRunnerUID: string; // RunnerUID del usuario que recibe la notificación

  @IsString()
  @IsNotEmpty()
  fromRunnerUID: string; // RunnerUID del usuario que envía la notificación

  @IsString()
  @IsNotEmpty()
  tipo: string; // Tipo de notificación (ej: "follow", "like", "comment", etc.)

  @IsString()
  @IsOptional()
  mensaje?: string; // Mensaje opcional de la notificación
}
