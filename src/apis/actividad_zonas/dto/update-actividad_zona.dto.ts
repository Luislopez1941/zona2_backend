import { PartialType } from '@nestjs/swagger';
import { CreateActividadZonaDto } from './create-actividad_zona.dto';

export class UpdateActividadZonaDto extends PartialType(CreateActividadZonaDto) {}
