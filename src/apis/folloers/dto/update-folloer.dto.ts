import { PartialType } from '@nestjs/swagger';
import { CreateFolloerDto } from './create-folloer.dto';

export class UpdateFolloerDto extends PartialType(CreateFolloerDto) {}
