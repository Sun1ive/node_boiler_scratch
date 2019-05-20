import { Exception } from './exception';
import { ERROR_CODE } from './enum/error.code';
import { XRPC } from '../schemas/x-rpc.schema';

export interface IMethodNotImplementedData extends XRPC.Params {
  service: string | null;
  method: string;
}

export class MethodNotImplemented extends Exception {
  public data?: IMethodNotImplementedData;

  public static fromRequest(request: XRPC.Request) {
    return new MethodNotImplemented(request.service, request.method);
  }

  public static fromDescription(service: string | null, method: string) {
    return new MethodNotImplemented(service, method);
  }

  public constructor(service: string | null, method: string) {
    super(
      'MethodNotImplemented',
      `Method ${service || ''}::${method} is not implemented`,
      ERROR_CODE.METHOD_NOT_IMPLEMENTED,
      undefined,
      { method }
    );
  }
}
