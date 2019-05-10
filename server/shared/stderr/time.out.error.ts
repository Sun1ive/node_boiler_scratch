import { DeferredTask } from '../util/deferred';
import { Common } from '../schemas/common.schema';
import { Exception } from './exception';
import { ERROR_CODE } from './enum/error.code';

export class TimeOutError extends Exception {
  public static defer(
    service: string | null,
    method: string,
    time: Common.PositiveInteger
  ): DeferredTask<never> {
    const task = new DeferredTask(() => {
      throw new TimeOutError(service, method, time);
    });
    task.defer(time);
    return task;
  }

  constructor(
    service: string | null,
    method: string,
    time: Common.PositiveInteger
  ) {
    super(
      'TimeOut',
      `Method ${service}::${method} runs more than ${time} milliseconds`,
      ERROR_CODE.METHOD_IS_TIMED_OUT
    );
  }
}
