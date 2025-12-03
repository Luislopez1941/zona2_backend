import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/api/notificaciones',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacionesGateway.name);
  // Mapa para almacenar las conexiones por RunnerUID
  private connectedClients = new Map<string, Set<string>>();

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const runnerUID = client.handshake.query.runnerUID as string;

    if (!runnerUID) {
      this.logger.warn(`Cliente conectado sin RunnerUID: ${client.id}`);
      client.disconnect();
      return;
    }

    // Agregar el cliente al mapa de conexiones
    if (!this.connectedClients.has(runnerUID)) {
      this.connectedClients.set(runnerUID, new Set());
    }
    this.connectedClients.get(runnerUID)?.add(client.id);

    // Unir al cliente a una sala específica para su RunnerUID
    client.join(`runner:${runnerUID}`);

    this.logger.log(
      `Cliente conectado: ${client.id} para RunnerUID: ${runnerUID}`,
    );
    this.logger.log(
      `Total de clientes conectados para ${runnerUID}: ${this.connectedClients.get(runnerUID)?.size}`,
    );

    // Enviar confirmación de conexión
    client.emit('connected', {
      message: 'Conectado al servidor de notificaciones',
      runnerUID,
    });

    // Consultar directamente la tabla de notificaciones usando toRunnerUID
    try {
      // Buscar todas las notificaciones no leídas del usuario
      const notificaciones = await this.prisma.notificaciones.findMany({
        where: {
          toRunnerUID: runnerUID, // Buscar por toRunnerUID que viene del frontend
          leida: false, // Solo no leídas
        },
        orderBy: {
          fecha: 'desc',
        },
      });

      // Si hay notificaciones, obtener información de los usuarios que las enviaron
      if (notificaciones.length > 0) {
        const fromRunnerUIDs = [
          ...new Set(notificaciones.map((n) => n.fromRunnerUID)),
        ];
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

        // Enviar cada notificación al cliente
        notificaciones.forEach((notificacion) => {
          client.emit('notification', {
            id: notificacion.id,
            toRunnerUID: notificacion.toRunnerUID,
            fromRunnerUID: notificacion.fromRunnerUID,
            tipo: notificacion.tipo,
            mensaje: notificacion.mensaje,
            leida: notificacion.leida,
            fecha: notificacion.fecha,
            fromUser: usuariosMap.get(notificacion.fromRunnerUID) || null,
          });
        });

        this.logger.log(
          `Enviadas ${notificaciones.length} notificaciones no leídas a RunnerUID: ${runnerUID}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al obtener notificaciones para RunnerUID ${runnerUID}:`,
        error,
      );
    }
  }

  handleDisconnect(client: Socket) {
    // Buscar y remover el cliente del mapa
    for (const [runnerUID, clients] of this.connectedClients.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.connectedClients.delete(runnerUID);
        }
        this.logger.log(
          `Cliente desconectado: ${client.id} para RunnerUID: ${runnerUID}`,
        );
        break;
      }
    }
  }

  /**
   * Emite una notificación a un usuario específico por su RunnerUID
   */
  emitNotification(toRunnerUID: string, notification: any) {
    this.server.to(`runner:${toRunnerUID}`).emit('notification', notification);
    this.logger.log(
      `Notificación emitida a RunnerUID: ${toRunnerUID}`,
    );
  }

  /**
   * Obtiene el número de clientes conectados para un RunnerUID
   */
  getConnectedClientsCount(runnerUID: string): number {
    return this.connectedClients.get(runnerUID)?.size || 0;
  }

  /**
   * Verifica si un RunnerUID tiene clientes conectados
   */
  isRunnerUIDConnected(runnerUID: string): boolean {
    return (
      this.connectedClients.has(runnerUID) &&
      (this.connectedClients.get(runnerUID)?.size || 0) > 0
    );
  }
}

