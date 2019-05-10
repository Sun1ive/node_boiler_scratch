import { Exception } from './exception';
import { ERROR_CODE } from './enum/error.code';

export class Cancelled extends Exception {
  public constructor(reason: string) {
    super('Cancelled', `Cancelled. Reason: ${reason}`, ERROR_CODE.CANCELLED);
  }
}
