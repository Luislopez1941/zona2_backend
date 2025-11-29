import { PartialType } from '@nestjs/mapped-types';
import { CreateFollowerDto } from './create-followers.dto';

export class UpdateFollowerDto extends PartialType(CreateFollowerDto) {}
    