import { PartialType } from '@nestjs/swagger';
import { CreateInscripcioneDto } from './create-inscripcione.dto';

export class UpdateInscripcioneDto extends PartialType(CreateInscripcioneDto) {}
