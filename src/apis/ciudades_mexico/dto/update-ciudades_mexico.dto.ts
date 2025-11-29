import { PartialType } from '@nestjs/swagger';
import { CreateCiudadesMexicoDto } from './create-ciudades_mexico.dto';

export class UpdateCiudadesMexicoDto extends PartialType(CreateCiudadesMexicoDto) {}
