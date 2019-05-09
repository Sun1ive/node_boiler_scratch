import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ path: '/', transports: ['websocket'] })
export class SocketGateway implements NestGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(client: any, data: string): string {
    return data;
  }

  @SubscribeMessage('get_orders')
  getOrdersHandler(client: Socket): void {
    client.emit('get_orders', { foo: 'bar' });
  }

  afterInit() {}

  handleConnection(client: Socket) {
    console.log(client.id);
    setInterval(() => {
      client.emit('ordersChanged', { '1': 2 });
    }, 3000);
  }

  handleDisconnect() {}
}
