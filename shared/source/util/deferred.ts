'use strict';

export enum TASK_STATE {
    ERROR = 'ERROR',
    CANCELLED = 'CANCELLED',
    NONE = 'NONE',
    WAITING = 'WAITING',
    RUNNING = 'RUNNING',
    DONE = 'DONE',
}

export interface IDeferred<ResultType = any> {
    readonly promise: Promise<ResultType>;
    resolve(value?: ResultType | PromiseLike<ResultType>): void;
    reject(reason?: any): void;
}

export interface IDeferredTask<ResultType = any> {
    readonly promise: Promise<ResultType>;
    readonly state: TASK_STATE;
    defer(delay: number): boolean;
    cancel(): boolean;
}

export class Deferred<ResultType = any> implements IDeferred<ResultType> {
    public readonly promise: Promise<ResultType>;
	public readonly resolve: (value?: ResultType | PromiseLike<ResultType>) => void = () => { };
	public readonly reject: (reason?: any) => void = () => { };

    private readonly _executor = (resolve: (value?: ResultType | PromiseLike<ResultType>) => void, reject: (reason?: any) => void): void => {
        Object.defineProperty(this, 'resolve', {
            value: resolve,
            writable: false,
            enumerable: true,
            configurable: false,
        });
        Object.defineProperty(this, 'reject', {
            value: reject,
            writable: false,
            enumerable: true,
            configurable: false,
        });
    };

    public constructor() {
        this.promise = new Promise<ResultType>(this._executor);
    }
}

export class DeferredTask<ResultType = any> implements IDeferredTask<ResultType> {
    public readonly promise: Promise<ResultType>;
    public readonly callback: () => ResultType | Promise<ResultType>;
    public state: TASK_STATE;

	private readonly _resolve: (value?: ResultType | PromiseLike<ResultType>) => void = () => { };
    private readonly _reject: (reason?: any) => void = () => { };
    private _timeout: any;

    private readonly _promiseExecutor = (resolve: (value?: ResultType | PromiseLike<ResultType>) => void, reject: (reason?: any) => void): void => {
        Object.defineProperty(this, '_resolve', {
            value: resolve,
            writable: false,
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(this, '_reject', {
            value: reject,
            writable: false,
            enumerable: false,
            configurable: false,
        });
    };

    private readonly _complete = (error?: Error, result?: ResultType): void => {
        if (error) {
            this.state = TASK_STATE.ERROR;
            this._reject(error);
        } else {
            this.state = TASK_STATE.DONE;
            this._resolve(result);
        }
    };

    private readonly _taskExecutor = (): void => {
        this.state = TASK_STATE.RUNNING;
        var result: any;
        try {
            result = this.callback();
            if (result instanceof Promise) {
                result.then(
                    this._complete.bind(this, undefined),
                    this._complete,
                );
            } else {
                this._complete(undefined, result);
            }
        } catch (error) {
            this._complete(error);
        }
    };

    public constructor(callback: () => ResultType | Promise<ResultType>) {
        this.promise = new Promise<ResultType>(this._promiseExecutor);
        this.state = TASK_STATE.NONE;
        this.callback = callback;
    }

    public readonly defer = (delay?: number) => {
        if (this.state === TASK_STATE.NONE) {
            this.state = TASK_STATE.WAITING;
            this._timeout = setTimeout(this._taskExecutor, typeof delay === 'number' && delay >= 1 ? delay : 1);
            return true;
        } else {
            return false;
        }
    };

    public readonly cancel = () => {
        if (this.state === TASK_STATE.WAITING) {
            clearTimeout(this._timeout);
            this._timeout = undefined;
            this.state = TASK_STATE.CANCELLED;
            return true;
        } else {
            return false;
        }
    };
}
