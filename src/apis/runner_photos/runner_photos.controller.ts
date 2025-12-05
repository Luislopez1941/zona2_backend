import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RunnerPhotosService } from './runner_photos.service';
import { CreateRunnerPhotoDto } from './dto/create-runner_photo.dto';
import { UpdateRunnerPhotoDto } from './dto/update-runner_photo.dto';

@Controller('runner-photos')
export class RunnerPhotosController {
  constructor(private readonly runnerPhotosService: RunnerPhotosService) {}

  @Post()
  create(@Body() createRunnerPhotoDto: CreateRunnerPhotoDto) {
    return this.runnerPhotosService.create(createRunnerPhotoDto);
  }

  @Get('get-all')
  findAll() {
    return this.runnerPhotosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.runnerPhotosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRunnerPhotoDto: UpdateRunnerPhotoDto) {
    return this.runnerPhotosService.update(+id, updateRunnerPhotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.runnerPhotosService.remove(+id);
  }
}
