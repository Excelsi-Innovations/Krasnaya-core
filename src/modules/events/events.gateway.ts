import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    client.join(room);
    return { event: 'joined', data: `Joined room ${room}` };
  }

  // Method to emit events to specific rooms (e.g., for monitoring)
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
  
  // Method to emit to all clients (e.g., global monitoring)
  emitGlobal(event: string, data: any) {
    this.server.emit(event, data);
  }
}
