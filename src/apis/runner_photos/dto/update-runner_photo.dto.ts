import { PartialType } from '@nestjs/swagger';
import { CreateRunnerPhotoDto } from './create-runner_photo.dto';

export class UpdateRunnerPhotoDto extends PartialType(CreateRunnerPhotoDto) {}
