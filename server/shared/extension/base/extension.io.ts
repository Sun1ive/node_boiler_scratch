// tslint:disable
import { EventEmitter } from 'events';
import * as uuid from 'uuid';

import { XRPC } from '../../schemas/x-rpc.schema';
import { Cancelled } from '../../stderr/cancelled';
import { Exception } from '../../stderr/exception';
import { MethodNotImplemented } from '../../stderr/method.not.implemented';
import { TimeOutError } from '../../stderr/time.out.error';
import { Unexpected } from '../../stderr/unexpected';
import { ArrayMap } from '../../util/array.map';
import { Deferred, DeferredTask } from '../../util/deferred';
import { NameSpace } from '../../util/name.space';
import { IExtension } from './extension.interface';
import { IServiceEndpoint } from './service.endpoint.interface';
import { IServiceProxy, IRemoteCallOption } from './service.proxy.interface';

function addKey(space: NameSpace, key: string): NameSpace {
  space[key] = undefined;
  return space;
}

function clearNamespace(
  space: NameSpace,
  keys: ReadonlyArray<string>
): NameSpace {
  return keys.reduce(addKey, space);
}

function getServiceName(service: IServiceProxy | IServiceEndpoint): string {
  return service.service;
}

class ServiceMap<
  ServiceType extends IServiceProxy | IServiceEndpoint
> extends ArrayMap<string, ServiceType> {
  private readonly _extension: IExtension;
  private readonly _subscribe: (service: ServiceType) => void;
  private readonly _unsubscribe: (service: ServiceType) => void;

  public constructor(
    extension: IExtension,
    subscribe: (service: ServiceType) => void,
    unsubscribe: (service: ServiceType) => void
  ) {
    super([], getServiceName);
    this._extension = extension;
    this._subscribe = subscribe;
    this._unsubscribe = unsubscribe;
  }

  public addValue(value: ServiceType): this {
    super.addValue(value);
    this._subscribe(value);
    return this;
  }

  public set(key: string, value: ServiceType): this {
    super.set(key, value);
    this._subscribe(value);
    return this;
  }

  public delete(name: string): boolean {
    var old = this.get(name);
    if (old) {
      this._unsubscribe(old);
    }
    return super.deleteValue(old!);
  }

  public deleteValue(service: ServiceType): boolean {
    var result = super.deleteValue(service);
    if (result) {
      this._unsubscribe(service);
    }
    return result;
  }

  public clear(): void {
    for (let value of this.values()) {
      this._unsubscribe(value);
    }
    super.clear();
  }
}

function defaultPropertySignalName(propertyKey: string): string {
  return propertyKey + 'Changed';
}

export class ServiceProxy extends EventEmitter implements IServiceProxy {
  private _extension: IExtension | null;
  private readonly _properties: NameSpace;
  private readonly _commonSignalName: string | null;
  private readonly _propertySignalName:
    | ((propertyKey: string) => string | undefined)
    | null;

  public readonly service: string;

  public constructor(
    service: string,
    commonSignalName: string | null = 'PropertiesChanged',
    propertySignalNameFactory:
      | ((propertyKey: string) => string | undefined)
      | null = defaultPropertySignalName
  ) {
    super();
    this._extension = null;
    this.service = service;
    this._commonSignalName = commonSignalName;
    this._propertySignalName = propertySignalNameFactory;
    this._properties = {};
  }

  public get isAttached(): boolean {
    return !!this._extension;
  }

  public get(...names: string[]): Readonly<NameSpace> {
    if (names.length === 0) {
      return Object.assign({}, this._properties);
    } else {
      const result: NameSpace = {};
      for (let name of names) {
        if (this._properties.hasOwnProperty(name)) {
          result[name] = this._properties[name];
        }
      }
      return result;
    }
  }

  public set(props: Readonly<NameSpace>, external?: boolean): void {
    const diff: NameSpace = {};
    const dropped: string[] = [];
    let emitChanges = false;
    for (let [name, value] of Object.entries(props)) {
      if (this._properties[name] !== value) {
        emitChanges = !!this._commonSignalName;
        if (value !== undefined) {
          diff[name] = value;
        } else {
          dropped.push(name);
        }
      }
    }
    if (this._propertySignalName) {
      for (let [name, value] of Object.entries(diff)) {
        const signal = this._propertySignalName(name);
        if (signal) {
          this._properties[name] = value;
          super.emit(signal, value);
        }
      }
      for (let name of dropped) {
        const signal = this._propertySignalName(name);
        if (signal) {
          this._properties[name] = undefined;
          super.emit(signal, undefined);
        }
      }
    }
    if (emitChanges) {
      if (!external && this._extension) {
        const params = { changed: diff, dropped };
        this._extension.request(this.service, '<set>', params).then(
          result => undefined,
          error => {
            console.warn(
              `${this.service}.<set>(${JSON.stringify(params)}):`,
              error
            );
          }
        );
      }
      super.emit(this._commonSignalName!, diff, dropped);
    }
  }

  public call(
    method: string,
    params: XRPC.Params,
    options?: Partial<IRemoteCallOption>
  ): Promise<any> {
    var stop =
      options && options.timeout ? Date.now() + options.timeout : undefined;
    var waiter: Promise<void>;
    var deferred: DeferredTask<never> | undefined;
    if (this.isAttached) {
      waiter = Promise.resolve();
    } else if (options && options.waitForAttach) {
      waiter = new Promise<void>(resolve => this.once('attach', resolve));
      if (stop) {
        deferred = TimeOutError.defer(this.service, method, stop - Date.now());
        waiter = Promise.race([waiter, deferred.promise]);
      }
    } else {
      waiter = Promise.reject(new Cancelled('No connection!'));
    }
    return waiter.then(() => {
      if (deferred) {
        deferred.cancel();
      }
      if (this._extension) {
        return this._extension.request(
          this.service,
          method,
          params,
          stop ? stop - Date.now() : undefined
        );
      } else {
        throw new Cancelled('No connection!');
      }
    });
  }

  public emit(event: string | symbol, ...params: any[]): boolean {
    var result = super.emit(event, ...params);
    if (this._extension && typeof event === 'string') {
      result = this._extension.publish(this.service, event, ...params);
    }
    return result;
  }

  public set extension(value: IExtension | null) {
    var old = this._extension;
    this._extension = value;
    if (!value !== !old) {
      if (value) {
        console.log(this.service, 'attach');
        super.emit('attach');
      } else {
        console.log(this.service, 'detach');
        super.emit('detach');
      }
    }
  }

  public get extension(): IExtension | null {
    return this._extension;
  }
}

export class ExtensionIo extends EventEmitter implements IExtension {
  private readonly _socket: SocketIOClient.Socket;
  private readonly _attached: Set<string>;
  private readonly _subscribed: Set<string>;
  private readonly _listeners: Array<{
    event: string;
    callback: (...args: any[]) => void;
  }>;
  private readonly _requests: Map<XRPC.MessageId, Deferred<any>>;

  public readonly proxies: ServiceMap<IServiceProxy>;
  public readonly endpoints: ServiceMap<IServiceEndpoint>;

  private readonly _attachEndpoint = (endpoint: IServiceEndpoint): void => {
    this._attached.add(endpoint.service);
    if (this._socket.connected) {
      this._socket.emit('service_attach', endpoint.service);
      endpoint.extension = this;
    }
  };

  private readonly _detachEndpoint = (endpoint: IServiceEndpoint): void => {
    this._attached.delete(endpoint.service);
    if (this._socket.connected) {
      this._socket.emit('service_detach', endpoint.service);
      endpoint.extension = null;
    }
  };

  private readonly _subscribeProxy = (proxy: IServiceProxy): void => {
    if (this._socket.connected && this._attached.has(proxy.service)) {
      this._socket.emit('service_subscribe', proxy.service);
      this._requestProps(proxy.service);
    }
  };

  private readonly _unsubscribeProxy = (proxy: IServiceProxy): void => {
    if (this._socket.connected && this._attached.has(proxy.service)) {
      proxy.set(clearNamespace({}, Object.keys(proxy.get())), true);
      proxy.extension = null;
      this._socket.emit('service_unsubscribe', proxy.service);
    }
  };

  private readonly _addSocketListener = (
    event: string,
    callback: (...args: any[]) => void
  ): void => {
    this._socket.on(event, callback);
    this._listeners.push({ event, callback });
  };

  private readonly _removeSocketListener = (
    event: string,
    callback?: (...args: any[]) => void
  ): void => {
    if (callback) {
      const index = this._listeners.findIndex(
        element => element.event === event && element.callback === callback
      );
      if (index >= 0) {
        this._socket.removeListener(event, callback);
        this._listeners.splice(index, 1);
      }
    } else {
      let index: number;
      while (
        (index = this._listeners.findIndex(
          element => element.event === event
        )) >= 0
      ) {
        const { event, callback } = this._listeners[index];
        this._socket.removeListener(event, callback);
        this._listeners.splice(index, 1);
      }
    }
  };

  private readonly _removeSocketListeners = (): void => {
    const listeners = this._listeners.splice(0, this._listeners.length);
    for (let { event, callback } of listeners) {
      this._socket.removeListener(event, callback);
    }
  };

  private readonly _onConnect = (): void => {
    for (let endpoint of this.endpoints.values()) {
      endpoint.extension = this;
      this._socket.emit('service_attach', endpoint.service);
    }
    for (let proxy of this.proxies.values()) {
      if (this._attached.has(proxy.service)) {
        proxy.extension = this;
      }
    }
  };

  private readonly _onDisconnect = (): void => {
    for (let proxy of this.proxies.values()) {
      proxy.extension = null;
    }
    for (let endpoint of this.endpoints.values()) {
      endpoint.extension = null;
    }
    this._subscribed.clear();
    this._attached.clear();
  };

  private readonly _requestProps = (serviceName: string): Promise<void> => {
    return this.request(serviceName, '<get>', {}).then(
      (props: NameSpace) => {
        const service = this.proxies.get(serviceName);
        if (service) {
          service.set(props, true);
          service.extension = this;
        }
      },
      error => {
        const service = this.proxies.get(serviceName);
        if (service) {
          service.extension = this;
        }
        console.warn(error);
      }
    );
  };

  private readonly _onServiceAttach = (service: string): void => {
    this._attached.add(service);
    const proxy = this.proxies.get(service);
    if (proxy) {
      this._socket.emit('service_subscribe', service);
      this._requestProps(service);
    }
  };

  private readonly _onServiceDetach = (service: string): void => {
    this._attached.delete(service);
    const proxy = this.proxies.get(service);
    if (proxy) {
      proxy.set(clearNamespace({}, Object.keys(proxy.get())), true);
      proxy.extension = null;
    }
  };

  private readonly _onServiceSubscribe = (service: string): void => {
    this._subscribed.add(service);
  };

  private readonly _onServiceUnsubscribe = (service: string): void => {
    this._subscribed.delete(service);
  };

  private readonly _onServiceEvent = (payload: XRPC.Event): void => {
    const service = payload.service;
    const proxy = this.proxies.get(service!);
    if (proxy) {
      if (payload.name === 'PropertiesChanged') {
        const [changed, dropped] = payload.params as [
          Readonly<NameSpace>,
          ReadonlyArray<string>
        ];
        proxy.set(clearNamespace(Object.assign({}, changed), dropped), true);
      } else {
        proxy.emit(payload.name, ...payload.params);
      }
    }
  };

  private readonly _onServiceResponse = (payload: XRPC.Response): void => {
    const { id, result, error } = payload as XRPC.SuccessResponse &
      XRPC.ErrorResponse;
    const deferred = this._requests.get(id);
    if (deferred) {
      this._requests.delete(id);
      if (error) {
        deferred.reject(
          new Exception(
            error.name,
            error.message,
            error.code,
            error.extendedCode,
            error.data
          )
        );
      } else {
        deferred.resolve(result);
      }
    }
  };

  private readonly _handleRequestRaw = (
    endpoint: IServiceEndpoint,
    method: string,
    params: XRPC.Params,
    timeout?: DeferredTask<never>
  ): Promise<any> => {
    switch (method) {
      case '<get>':
        if (timeout) {
          timeout.cancel();
        }
        try {
          const result = endpoint.get();
          endpoint.flush();
          return Promise.resolve(result);
        } catch (error) {
          return Promise.reject(error);
        }
        break;
      case '<set>':
        if (timeout) {
          timeout.cancel();
        }
        try {
          const changed = (params.changed || {}) as NameSpace;
          const dropped = (params.dropped || []) as Array<string>;
          dropped.forEach(property => {
            changed[property] = undefined;
          }, changed);
          endpoint.set(changed as NameSpace);
          endpoint.flush();
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
        break;
      default:
        return endpoint.handle(method, params).then(
          result => {
            if (timeout) {
              timeout.cancel();
            }
            endpoint.flush();
            return result;
          },
          error => {
            if (timeout) {
              timeout.cancel();
            }
            endpoint.flush();
            throw error;
          }
        );
        break;
    }
  };

  private readonly _onServiceRequest = (payload: XRPC.Request): void => {
    const service = payload.service;
    const endpoint =
      typeof service === 'string' ? this.endpoints.get(service) : undefined;
    const timeLeft = payload.valid_until
      ? payload.valid_until - Date.now()
      : undefined;
    const timeoutDeferred = timeLeft
      ? TimeOutError.defer(payload.service, payload.method, timeLeft)
      : undefined;
    if (timeoutDeferred) {
      timeoutDeferred.promise.catch(error => {
        this.emit('request_timeout', payload);
      });
    }
    if (endpoint) {
      this._handleRequestRaw(
        endpoint,
        payload.method,
        payload.params,
        timeoutDeferred
      ).then(
        (result: any) => {
          this._socket.emit('service_response', {
            id: payload.id,
            result
          });
        },
        (error: Error) => {
          this._socket.emit('service_response', {
            id: payload.id,
            error: Unexpected.fromError(error)
          });
        }
      );
    } else {
      this._socket.emit('service_response', {
        id: payload.id,
        error: new MethodNotImplemented(payload.service, payload.method)
      });
    }
  };

  public constructor(socket: SocketIOClient.Socket) {
    super();
    this._socket = socket;
    this._attached = new Set();
    this._subscribed = new Set();
    this._listeners = [];
    this.proxies = new ServiceMap(
      this,
      this._subscribeProxy,
      this._unsubscribeProxy
    );
    this.endpoints = new ServiceMap(
      this,
      this._attachEndpoint,
      this._detachEndpoint
    );
    this._requests = new Map();

    for (let event of [
      'connect',
      'connect_error',
      'connect_timeout',
      'error',
      'disconnect',
      'reconnect',
      'reconnect_attempt',
      'reconnecting',
      'reconnect_error',
      'reconnect_failed'
    ]) {
      this._addSocketListener(event, super.emit.bind(event));
    }

    for (let event of ['connect', 'reconnect']) {
      this._addSocketListener(event, this._onConnect);
    }

    for (let event of ['disconnect']) {
      this._addSocketListener(event, this._onDisconnect);
    }

    this._addSocketListener('service_event', this._onServiceEvent);
    this._addSocketListener('service_request', this._onServiceRequest);
    this._addSocketListener('service_response', this._onServiceResponse);
    this._addSocketListener('service_attach', this._onServiceAttach);
    this._addSocketListener('service_detach', this._onServiceDetach);
    this._addSocketListener('service_subscribe', this._onServiceSubscribe);
    this._addSocketListener('service_unsubscribe', this._onServiceUnsubscribe);

    if (this.ready) {
      this._onConnect();
    }
  }

  public get attached(): ReadonlySet<string> {
    return this._attached;
  }

  public request(
    service: string | null,
    method: string,
    params: XRPC.Params,
    timeout?: number
  ): Promise<any> {
    const deferred = new Deferred();
    const validUntil =
      typeof timeout === 'number' && timeout > 0
        ? Date.now() + timeout
        : undefined;
    const endpoint = this.endpoints.get(service!);
    if (!endpoint) {
      const id = uuid.v4();
      const request: XRPC.Request = {
        id,
        service,
        method,
        params,
        valid_until: validUntil
      };
      if (typeof timeout === 'number' && timeout > 0) {
        const timeoutDeferred = TimeOutError.defer(service, method, timeout);
        deferred.promise.then(timeoutDeferred.cancel, timeoutDeferred.cancel);
        timeoutDeferred.promise.catch(error => {
          this._onServiceResponse({
            id,
            error
          });
        });
      }
      this._requests.set(id, deferred);
      this._socket.emit('service_request', request);
    } else {
      if (typeof timeout === 'number' && timeout > 0) {
        const timeoutDeferred = TimeOutError.defer(service, method, timeout);
        deferred.promise.then(timeoutDeferred.cancel, timeoutDeferred.cancel);
        Promise.race([
          this._handleRequestRaw(endpoint, method, params, timeoutDeferred),
          timeoutDeferred.promise
        ]).then(deferred.resolve, deferred.reject);
      } else {
        this._handleRequestRaw(endpoint, method, params).then(
          deferred.resolve,
          deferred.reject
        );
      }
    }
    return deferred.promise;
  }

  public publish(service: string, name: string, ...params: any[]): boolean {
    let result: boolean = false;
    const payload: XRPC.Event = {
      id: null,
      service,
      name,
      params
    };
    if (this.proxies.has(service)) {
      this.emit('service_event', payload);
      result = true;
    }
    if (this._subscribed.has(service)) {
      this._socket.emit('service_event', payload);
      result = true;
    }
    return result;
  }

  public stop(): void {
    for (let def of this._requests.values()) {
      def.reject(new Cancelled('No connection!'));
    }
    this._requests.clear();
    this.proxies.clear();
    this.endpoints.clear();
    this._removeSocketListeners();
  }

  public get ready(): boolean {
    return this._socket.connected;
  }
}
