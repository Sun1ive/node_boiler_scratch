import { Exception } from './exception';
import { ERROR_CODE } from './enum/error.code';
import { XRPC } from '../schemas/x-rpc.schema';

export interface IEventNotImplementedData extends XRPC.Params {
  service: string | null;
  name: string;
}

export class EventNotImplemented extends Exception {
  public data?: IEventNotImplementedData;

  public static fromEvent(event: XRPC.Event) {
    return new EventNotImplemented(event.service, event.name);
  }

  public static fromDescription(service: string | null, name: string) {
    return new EventNotImplemented(service, name);
  }

  public constructor(service: string | null, name: string) {
    super(
      'EventNotImplemented',
      `Event ${service || ''}::${name} is not implemented`,
      ERROR_CODE.EVENT_NOT_IMPLEMENTED,
      undefined,
      { name }
    );
  }
}
