import { PartialType } from '@nestjs/swagger';
import { CreatePromocioneDto } from './create-promocione.dto';

export class UpdatePromocioneDto extends PartialType(CreatePromocioneDto) {}
