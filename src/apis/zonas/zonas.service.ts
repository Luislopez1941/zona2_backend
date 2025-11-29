import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Injectable()
export class ZonasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createZonaDto: CreateZonaDto) {
    return 'This action adds a new zona';
  }

  // Obtener todas las zonas que recibió un usuario
  async findByRunnerUID(runnerUID: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runnerUID} no encontrado`,
      );
    }

    // Obtener todas las zonas que recibió el usuario (donde RunnerUID es el que recibe)
    const zonas = await this.prisma.zonas.findMany({
      where: {
        RunnerUID: runnerUID, // Zonas que recibió este usuario
      },
      orderBy: {
        fecha: 'desc', // Más recientes primero
      },
    });

    return {
      message: 'Zonas obtenidas exitosamente',
      status: 'success',
      total: zonas.length,
      runnerUID,
      zonas,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} zona`;
  }

  update(id: number, updateZonaDto: UpdateZonaDto) {
    return `This action updates a #${id} zona`;
  }

  remove(id: number) {
    return `This action removes a #${id} zona`;
  }
}
