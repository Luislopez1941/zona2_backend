import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  namespace: '/notificaciones',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const runnerUID = client.handshake.query.runnerUID as string;

    if (!runnerUID) {
      client.disconnect();
      return;
    }

    // Unir al cliente a una sala específica para su RunnerUID
    client.join(`runner:${runnerUID}`);

    // Enviar confirmación de conexión
    client.emit('connected', {
      message: 'Conectado al servidor de notificaciones',
      runnerUID,
    });
  }

  handleDisconnect(client: Socket) {
    // Socket.IO maneja automáticamente la desconexión de las salas
  }

  /**
   * Emite una notificación a un usuario específico por su RunnerUID
   */
  emitNotification(toRunnerUID: string, notification: any) {
    this.server.to(`runner:${toRunnerUID}`).emit('notification', notification);
  }

}

