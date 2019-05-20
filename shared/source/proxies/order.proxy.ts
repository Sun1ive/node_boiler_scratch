import { ServiceProxy } from '../extension/base/extension.io';
import { IOrderService } from '../interfaces/order.service.interface';

export class OrderProxy extends ServiceProxy implements IOrderService {
  public static get serviceName(): string {
    return 'order.service';
  }

  public constructor() {
    super(OrderProxy.serviceName);
  }

  public get totalOrders(): number {
    return this.get('totalOrders').totalOrders;
  }

  public set totalOrders(value: number) {
    this.set({ totalOrders: value });
  }
}
