import { PartialType } from '@nestjs/swagger';
import { CreateEstadosMexicoDto } from './create-estados_mexico.dto';

export class UpdateEstadosMexicoDto extends PartialType(CreateEstadosMexicoDto) {}
