import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRunnerPhotoDto } from './dto/create-runner_photo.dto';
import { UpdateRunnerPhotoDto } from './dto/update-runner_photo.dto';

@Injectable()
export class RunnerPhotosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRunnerPhotoDto: CreateRunnerPhotoDto) {
    return 'This action adds a new runnerPhoto';
  }

  async findAll() {
    const photos = await this.prisma.runner_photos.findMany({
      orderBy: {
        Fecha: 'desc',
      },
    });

    return {
      message: 'Fotos obtenidas exitosamente',
      status: 'success',
      total: photos.length,
      photos,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} runnerPhoto`;
  }

  update(id: number, updateRunnerPhotoDto: UpdateRunnerPhotoDto) {
    return `This action updates a #${id} runnerPhoto`;
  }

  remove(id: number) {
    return `This action removes a #${id} runnerPhoto`;
  }
}
