import { connect } from 'socket.io-client';
import { IOrderService } from '../../../server/shared/interfaces/order.service.interface';
import { ClientProxyExtension } from '../../../server/shared/extension/client.proxy.extension';

const isProd = process.env.NODE_ENV === 'production';

export class ConnectionService {
  private _extension: ClientProxyExtension;
  private static _instance: ConnectionService | null;

  public static get instance(): ConnectionService {
    if (ConnectionService._instance) {
      return ConnectionService._instance;
    }
    ConnectionService._instance = new ConnectionService();
    return ConnectionService._instance;
  }

  public readonly orderService: IOrderService;

  private constructor() {
    ConnectionService._instance = null;
    let socketHost: string = process.env.SOCKET_HOST || '127.0.0.1:3000';

    if (isProd) {
      socketHost = process.env.SOCKET_HOST || window.location.origin;
    }
    console.log(`socketHost`, socketHost);

    const io = connect(
      socketHost,
      { transports: ['websocket'] }
    );
    ClientProxyExtension.create(io);

    this._extension = ClientProxyExtension.instance;

    this.orderService = this._extension.orderService;
  }
}
