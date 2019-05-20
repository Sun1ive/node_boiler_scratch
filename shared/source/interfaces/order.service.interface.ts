import { NameSpace } from '../util/name.space';
import { TypedEmitter } from '../util/typed.emitter';

interface IIOrderServiceEventMap extends NameSpace<any[]> {
  attach: [];
  detach: [];

  totalOrdersChanged: [number];
}

export interface IOrderService extends TypedEmitter<IIOrderServiceEventMap> {
  isAttached: boolean;

  totalOrders: number;
}
