import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZonasActividadeDto } from './dto/create-zonas_actividade.dto';
import { UpdateZonasActividadeDto } from './dto/update-zonas_actividade.dto';

@Injectable()
export class ZonasActividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createZonasActividadeDto: CreateZonasActividadeDto) {
    const runnerUID = createZonasActividadeDto.RunnerUID;
    // Verificar que el usuario que da las zonas existe
    const usuarioDa = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!usuarioDa) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runnerUID} no encontrado`,
      );
    }

    // Verificar que la actividad existe y obtener el RunnerUID del dueño
    const actividad = await this.prisma.actividades.findUnique({
      where: { actID: createZonasActividadeDto.actID },
    });

    if (!actividad) {
      throw new NotFoundException(
        `Actividad con ID ${createZonasActividadeDto.actID} no encontrada`,
      );
    }

    const runnerUIDRecibe = actividad.RunnerUID; // Usuario que recibe las zonas

    // Verificar que el usuario que recibe existe
    const usuarioRecibe = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUIDRecibe },
    });

    if (!usuarioRecibe) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runnerUIDRecibe} no encontrado`,
      );
    }

    // Verificar que no se haya dado zonas a esta actividad antes (restricción única)
    const zonaExistente = await this.prisma.zonas_actividades.findFirst({
      where: {
        RunnerUID: runnerUID,
        actID: createZonasActividadeDto.actID,
      },
    });

    if (zonaExistente) {
      throw new ConflictException(
        `Ya has dado zonas a esta actividad anteriormente`,
      );
    }

    // Crear ambos registros en una transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Crear registro en zonas_actividades
      const zonaActividad = await tx.zonas_actividades.create({
        data: {
          RunnerUID: runnerUID,
          actID: createZonasActividadeDto.actID,
          puntos: createZonasActividadeDto.puntos,
          fecha: new Date(),
        },
      });

      // 2. Crear registro en zonas para el usuario que recibe
      const zona = await tx.zonas.create({
        data: {
          RunnerUID: runnerUIDRecibe, // Usuario que recibe las zonas
          RunnerUIDRef: runnerUID, // Usuario que da las zonas
          puntos: createZonasActividadeDto.puntos,
          motivo: 'R', // R de Runner
          origen: '3', // Origen 3
          fecha: new Date(),
        },
      });

      return {
        zonaActividad,
        zona,
      };
    });

    return {
      message: 'Zonas otorgadas exitosamente',
      status: 'success',
      zonaActividad: resultado.zonaActividad,
      zona: resultado.zona,
    };
  }

  // Verificar si un usuario ya dio zonas a una actividad
  async hasGivenZonas(runnerUID: string, actID: number) {
    const zona = await this.prisma.zonas_actividades.findFirst({
      where: {
        RunnerUID: runnerUID,
        actID: actID,
      },
    });

    return {
      hasGiven: !!zona,
      zona: zona || null,
    };
  }

  // Obtener todas las zonas que un usuario ha dado
  async getZonasGivenByUser(runnerUID: string) {
    const zonas = await this.prisma.zonas_actividades.findMany({
      where: {
        RunnerUID: runnerUID,
      },
      include: {
        actividades: {
          select: {
            actID: true,
            titulo: true,
            fechaActividad: true,
            RunnerUID: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return {
      message: 'Zonas obtenidas exitosamente',
      status: 'success',
      total: zonas.length,
      zonas,
    };
  }

  // Obtener todas las zonas recibidas por una actividad
  async getZonasByActivity(actID: number) {
    const zonas = await this.prisma.zonas_actividades.findMany({
      where: {
        actID: actID,
      },
      include: {
        actividades: {
          select: {
            actID: true,
            titulo: true,
            RunnerUID: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return {
      message: 'Zonas obtenidas exitosamente',
      status: 'success',
      total: zonas.length,
      totalPuntos: zonas.reduce((sum, z) => sum + z.puntos, 0),
      zonas,
    };
  }

  findAll() {
    return this.prisma.zonas_actividades.findMany({
      include: {
        actividades: {
          select: {
            actID: true,
            titulo: true,
            RunnerUID: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.zonas_actividades.findUnique({
      where: { id },
      include: {
        actividades: {
          select: {
            actID: true,
            titulo: true,
            RunnerUID: true,
          },
        },
      },
    });
  }

  update(id: number, updateZonasActividadeDto: UpdateZonasActividadeDto) {
    return this.prisma.zonas_actividades.update({
      where: { id },
      data: updateZonasActividadeDto,
    });
  }

  remove(id: number) {
    return this.prisma.zonas_actividades.delete({
      where: { id },
    });
  }
}
