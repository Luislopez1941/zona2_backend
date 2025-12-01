import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { NotificacionesGateway } from './notificaciones.gateway';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificacionesGateway))
    private readonly notificacionesGateway: NotificacionesGateway,
  ) {}

  async create(createNotificacioneDto: CreateNotificacioneDto) {
    // Verificar que el usuario que recibe existe
    const toUser = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: createNotificacioneDto.toRunnerUID },
    });

    if (!toUser) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${createNotificacioneDto.toRunnerUID} no encontrado`,
      );
    }

    // Verificar que el usuario que envía existe
    const fromUser = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: createNotificacioneDto.fromRunnerUID },
    });

    if (!fromUser) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${createNotificacioneDto.fromRunnerUID} no encontrado`,
      );
    }

    // Verificar si ya existe una notificación del mismo tipo (debido a la restricción única)
    const existingNotification = await this.prisma.notificaciones.findFirst({
      where: {
        toRunnerUID: createNotificacioneDto.toRunnerUID,
        fromRunnerUID: createNotificacioneDto.fromRunnerUID,
        tipo: createNotificacioneDto.tipo,
      },
    });

    if (existingNotification) {
      // Si existe, actualizar la fecha y marcar como no leída
      const updated = await this.prisma.notificaciones.update({
        where: { id: existingNotification.id },
        data: {
          mensaje: createNotificacioneDto.mensaje || existingNotification.mensaje,
          leida: false,
          fecha: new Date(),
        },
      });

      // Emitir notificación por Socket.IO
      this.notificacionesGateway.emitNotification(
        createNotificacioneDto.toRunnerUID,
        {
          id: updated.id,
          toRunnerUID: updated.toRunnerUID,
          fromRunnerUID: updated.fromRunnerUID,
          tipo: updated.tipo,
          mensaje: updated.mensaje,
          leida: updated.leida,
          fecha: updated.fecha,
        },
      );

      return {
        message: 'Notificación actualizada exitosamente',
        status: 'success',
        notificacion: updated,
      };
    }

    // Crear nueva notificación
    const notificacion = await this.prisma.notificaciones.create({
      data: {
        toRunnerUID: createNotificacioneDto.toRunnerUID,
        fromRunnerUID: createNotificacioneDto.fromRunnerUID,
        tipo: createNotificacioneDto.tipo,
        mensaje: createNotificacioneDto.mensaje || null,
        leida: false,
      },
    });

    // Emitir notificación por Socket.IO
    this.notificacionesGateway.emitNotification(
      createNotificacioneDto.toRunnerUID,
      {
        id: notificacion.id,
        toRunnerUID: notificacion.toRunnerUID,
        fromRunnerUID: notificacion.fromRunnerUID,
        tipo: notificacion.tipo,
        mensaje: notificacion.mensaje,
        leida: notificacion.leida,
        fecha: notificacion.fecha,
      },
    );

    return {
      message: 'Notificación creada exitosamente',
      status: 'success',
      notificacion,
    };
  }

  async findAll() {
    const notificaciones = await this.prisma.notificaciones.findMany({
      orderBy: {
        fecha: 'desc',
      },
    });

    return {
      message: 'Notificaciones obtenidas exitosamente',
      status: 'success',
      total: notificaciones.length,
      notificaciones,
    };
  }

  async findByToRunnerUID(toRunnerUID: string, leida?: boolean) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: toRunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${toRunnerUID} no encontrado`,
      );
    }

    // Construir el where clause
    const where: any = {
      toRunnerUID,
    };

    if (leida !== undefined) {
      where.leida = leida;
    }

    const notificaciones = await this.prisma.notificaciones.findMany({
      where,
      orderBy: {
        fecha: 'desc',
      },
    });

    // Obtener información de los usuarios que enviaron las notificaciones
    const fromRunnerUIDs = [...new Set(notificaciones.map((n) => n.fromRunnerUID))];
    const usuariosMap = new Map();

    if (fromRunnerUIDs.length > 0) {
      const usuarios = await this.prisma.sec_users.findMany({
        where: {
          RunnerUID: {
            in: fromRunnerUIDs,
          },
        },
        select: {
          RunnerUID: true,
          name: true,
          AliasRunner: true,
          picture: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
          TipoMembresia: true,
        },
      });

      usuarios.forEach((u) => usuariosMap.set(u.RunnerUID, u));
    }

    // Agregar información del usuario que envió la notificación
    const notificacionesConUsuario = notificaciones.map((notificacion) => ({
      ...notificacion,
      fromUser: usuariosMap.get(notificacion.fromRunnerUID) || null,
    }));

    return {
      message: 'Notificaciones obtenidas exitosamente',
      status: 'success',
      total: notificacionesConUsuario.length,
      noLeidas: notificacionesConUsuario.filter((n) => !n.leida).length,
      toRunnerUID,
      notificaciones: notificacionesConUsuario,
    };
  }

  async findOne(id: number) {
    const notificacion = await this.prisma.notificaciones.findUnique({
      where: { id },
    });

    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    // Obtener información del usuario que envió la notificación
    const fromUser = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: notificacion.fromRunnerUID },
      select: {
        RunnerUID: true,
        name: true,
        AliasRunner: true,
        picture: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        TipoMembresia: true,
      },
    });

    return {
      message: 'Notificación obtenida exitosamente',
      status: 'success',
      notificacion: {
        ...notificacion,
        fromUser: fromUser || null,
      },
    };
  }

  async markAsRead(id: number) {
    const notificacion = await this.findOne(id);

    const updated = await this.prisma.notificaciones.update({
      where: { id },
      data: { leida: true },
    });

    return {
      message: 'Notificación marcada como leída',
      status: 'success',
      notificacion: updated,
    };
  }

  async markAllAsRead(toRunnerUID: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: toRunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${toRunnerUID} no encontrado`,
      );
    }

    const resultado = await this.prisma.notificaciones.updateMany({
      where: {
        toRunnerUID,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    return {
      message: `${resultado.count} notificación(es) marcada(s) como leída(s)`,
      status: 'success',
      total: resultado.count,
    };
  }

  async update(id: number, updateNotificacioneDto: UpdateNotificacioneDto) {
    await this.findOne(id); // Verificar que existe

    const notificacion = await this.prisma.notificaciones.update({
      where: { id },
      data: updateNotificacioneDto,
    });

    return {
      message: 'Notificación actualizada exitosamente',
      status: 'success',
      notificacion,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.notificaciones.delete({
      where: { id },
    });

    return {
      message: 'Notificación eliminada exitosamente',
      status: 'success',
    };
  }
}
