import { Exception } from './exception';
import { ERROR_CODE } from './enum/error.code';

export class Unexpected extends Exception {
  public static fromError(reason: Error | string): Exception {
    if (reason instanceof Exception) {
      return reason;
    } else {
      return new Unexpected(reason);
    }
  }

  public constructor(reason: Error | string) {
    if (reason instanceof Error) {
      super(reason.name, reason.message, ERROR_CODE.UNEXPECTED);
    } else {
      super('Unexpected', reason, ERROR_CODE.UNEXPECTED);
    }
  }
}
