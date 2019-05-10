import { ServiceEndpoint } from '../../../shared/extension/base/service.endpoint';
import { tracked } from '../../../shared/util/tracked';
import { IOrderService } from '../../../shared/interfaces/order.service.interface';
import { basename } from 'path';

export class OrderEndPoint extends ServiceEndpoint implements IOrderService {
  public static get serviceName() {
    return 'order.service';
  }

  public constructor() {
    super(OrderEndPoint.serviceName);

    this.totalOrders = 0;

    setInterval(() => {
      this.totalOrders += 1;
      console.log(`[${basename(__filename)}]: totalOrders changed`);
    }, 100000);
  }

  @tracked()
  public totalOrders: number;
}
