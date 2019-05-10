import { ExtensionIo } from '../../shared/extension/base/extension.io';
import { OrderEndPoint } from '../providers/endpoint/order.endpoint';
import { IOrderService } from '../../shared/interfaces/order.service.interface';
import { basename } from 'path';

export class ClientEPExtension extends ExtensionIo {
  private static _instance: ClientEPExtension | null = null;

  public static create(socket: SocketIOClient.Socket) {
    if (ClientEPExtension._instance) {
      throw new Error('Already exists!');
    }
    ClientEPExtension._instance = new ClientEPExtension(socket);
  }

  public static get instance(): ClientEPExtension {
    if (!ClientEPExtension._instance) {
      throw new Error('Does not exists!');
    }
    return ClientEPExtension._instance;
  }

  private constructor(socket: SocketIOClient.Socket) {
    super(socket);
    console.log(`[${basename(__filename)}] started.`);
    for (const EndpointClass of [OrderEndPoint]) {
      this.endpoints.addValue(new EndpointClass());
    }
  }

  public stop() {
    super.stop();
    console.log(`ClientApiExtension has been stopped.`);
  }

  public get orderService(): IOrderService {
    return this.endpoints.get(OrderEndPoint.serviceName) as OrderEndPoint;
  }
}
