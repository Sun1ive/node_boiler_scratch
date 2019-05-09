import { connect } from 'socket.io-client';
import { Api } from '../../../shared/services/api.service';

export class ConnectionService {
  private _api: Api;
  private static _instance: ConnectionService;

  private constructor() {
    // const socketHost = process.env.REACT_APP_SOCKET || window.location.origin;
    const socketHost = '127.0.0.1:3000';
    console.log(`socketHost`, socketHost);

    const socket = connect(
      socketHost,
      { transports: ['websocket'] }
    );

    Api.create(socket);
    this._api = Api.instance;

    this.getOrders = this._api.getOrders;
    this.socket = this._api.socket;
  }

  public readonly getOrders: any;
  public readonly socket: SocketIOClient.Socket;

  public static get instance(): ConnectionService {
    if (!this._instance) {
      this._instance = new ConnectionService();

      return this._instance;
    }

    return this._instance;
  }
}
