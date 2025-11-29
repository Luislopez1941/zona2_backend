import { PartialType } from '@nestjs/swagger';
import { CreatePecerDto } from './create-pecer.dto';

export class UpdatePecerDto extends PartialType(CreatePecerDto) {}
