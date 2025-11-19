import { PartialType } from '@nestjs/mapped-types';
import { CreateSecUserDto } from './create-sec_user.dto';

export class UpdateSecUserDto extends PartialType(CreateSecUserDto) {}
