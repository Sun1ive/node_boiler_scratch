import { EventEmitter } from 'events';
import { XRPC } from '../../schemas/x-rpc.schema';
import { MethodNotImplemented } from '../../stderr/method.not.implemented';
import { NameSpace } from '../../util/name.space';
import { getProperties, setProperties } from '../../util/tracked';
import { IExtension } from './extension.interface';
import { IServiceEndpoint } from './service.endpoint.interface';

function reducePropertiesChanged(
  event: string,
  prev: undefined | any[],
  next: any[]
): [NameSpace, string[]] {
  if (prev) {
    const [_changed, _dropped] = prev as [NameSpace, string[]];
    const [changed, dropped] = next as [
      Readonly<NameSpace>,
      ReadonlyArray<string>
    ];
    for (const [name, value] of Object.entries(changed)) {
      const index = _dropped.indexOf(name);
      if (index >= 0) {
        _dropped.splice(index, 1);
      }
      _changed[name] = value;
    }
    for (const name of dropped) {
      if (_changed.hasOwnProperty(name)) {
        delete _changed[name];
      }
      _dropped.push(name);
    }
    return [_changed, _dropped];
  } else {
    return [Object.assign({}, next[0]), Array.from(next[1])];
  }
}

export type EventReducer = (
  event: string,
  old: any[] | undefined,
  next: any[]
) => any[] | boolean;

export class ServiceEndpoint extends EventEmitter implements IServiceEndpoint {
  private _extension: IExtension | null;
  private readonly _eventQueue: Map<string, any[]>;
  private _sender: any;

  public readonly service: string;
  public readonly eventCollector: Map<string, boolean | EventReducer>;

  public constructor(service: string) {
    super();
    this.service = service;
    this._eventQueue = new Map();
    this.eventCollector = new Map();
    this._extension = null;

    this.eventCollector.set('PropertiesChanged', reducePropertiesChanged);
  }

  public get isAttached(): boolean {
    return !!this._extension;
  }

  public get(...names: string[]): NameSpace {
    return getProperties(this);
  }

  public set(props: NameSpace): void {
    setProperties(this, props);
  }

  public handle(method: string, params: XRPC.Params): Promise<any> {
    return Promise.reject(new MethodNotImplemented(this.service, method));
  }

  public emit(event: string, ...args: any[]): boolean {
    const result = super.emit(event, ...args);
    const collector = this.eventCollector.get(event);
    if (typeof collector === 'function') {
      const prev = this._eventQueue.get(event);
      // tslint:disable-next-line
      const result = collector(event, prev, args);
      if (result instanceof Array) {
        this._eventQueue.set(event, result);
      } else if (result) {
        this._eventQueue.set(event, args);
      } else if (prev) {
        this._eventQueue.delete(event);
      }
    } else if (collector) {
      this._eventQueue.set(event, args);
    }
    if (
      this._eventQueue.size !== 0 &&
      this._extension &&
      this._sender === undefined
    ) {
      this._sender = setTimeout(this.flush.bind(this), 1);
    }
    return result;
  }

  public flush(): void {
    if (this._sender !== undefined) {
      clearTimeout(this._sender);
      this._sender = undefined;
    }
    if (this._extension && this._eventQueue.size) {
      for (const [name, args] of this._eventQueue) {
        this._extension.publish(this.service, name, ...args);
      }
      this._eventQueue.clear();
    }
  }

  public get extension(): IExtension | null {
    return this._extension;
  }

  public set extension(value: IExtension | null) {
    if ((value === null) === (this._extension === null)) {
      this._extension = value;
      return;
    }
    this._extension = value;
    if (value) {
      super.emit('attach');
    } else {
      super.emit('detach');
    }
  }
}
