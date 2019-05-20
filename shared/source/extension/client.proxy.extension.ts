import { ExtensionIo } from './base/extension.io';
import { IOrderService } from '../interfaces/order.service.interface';
import { OrderProxy } from '../proxies/order.proxy';

export class ClientProxyExtension extends ExtensionIo {
  private static _instance: ClientProxyExtension | null = null;

  public static create(socket: SocketIOClient.Socket) {
    if (ClientProxyExtension._instance) {
      throw new Error('Already exists!');
    }
    ClientProxyExtension._instance = new ClientProxyExtension(socket);
  }

  public static get instance(): ClientProxyExtension {
    if (!ClientProxyExtension._instance) {
      throw new Error('Does not exists!');
    }
    return ClientProxyExtension._instance;
  }

  private constructor(socket: SocketIOClient.Socket) {
    super(socket);
    for (const ProxyClass of [OrderProxy]) {
      this.proxies.addValue(new ProxyClass());
    }
  }

  public stop() {
    super.stop();
    console.log(`ClientExtension has been stopped.`);
  }

  public get orderService(): IOrderService {
    return (this.proxies.get(
      OrderProxy.serviceName
    ) as OrderProxy) as IOrderService;
  }
}
