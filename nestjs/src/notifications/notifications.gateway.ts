import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*', // Ajustar según las necesidades de seguridad en producción
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Aquí se podría implementar la lógica de autenticación y unión a salas
    // Por ejemplo: client.join(`user_${userId}`);
    // Por ahora, asumiremos que el cliente envía su userId en el handshake o un evento join
    const userId = client.handshake.query.userId as string;
    if (userId) {
      void client.join(`user_${userId}`);
      this.logger.log(`Client ${client.id} joined room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyUser(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }
}
