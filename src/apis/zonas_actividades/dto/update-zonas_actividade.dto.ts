import { PartialType } from '@nestjs/swagger';
import { CreateZonasActividadeDto } from './create-zonas_actividade.dto';

export class UpdateZonasActividadeDto extends PartialType(CreateZonasActividadeDto) {}
