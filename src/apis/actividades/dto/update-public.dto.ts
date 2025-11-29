import { IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdatePublicDto {
  @IsOptional()
  @IsNumber()
  actID?: number; // ID de la actividad específica a actualizar

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  actIDs?: number[]; // Array de IDs de actividades a actualizar

  @IsOptional()
  @IsBoolean()
  Publico?: boolean; // true para hacer pública, false para hacer privada
}

