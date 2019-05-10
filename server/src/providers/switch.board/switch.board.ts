import { EventEmitter } from 'events';
import * as IO from 'socket.io';
import { XRPC } from '../../../shared/schemas/x-rpc.schema';
import { basename } from 'path';

export class SwitchBoard extends EventEmitter {
  private readonly _server: IO.Namespace;
  private readonly _listeners: Array<{
    event: string;
    callback: (...args: any[]) => void;
  }>;
  private readonly _attached: Map<string, string>; // Service => SocketId
  private readonly _subscribed: Map<string, Set<string>>; // Service => Set<SocketId>
  private readonly _requests: Map<XRPC.MessageId, string>; // MessageId => SocketId

  private readonly _onSocketConnect = (socket: IO.Socket): void => {
    console.log('Connect: %s', socket.id);
    for (const name of this._attached.keys()) {
      socket.emit('service_attach', name);
    }
    socket.on('service_attach', (service: string) => {
      const oldSocket = this._attached.get(service);
      if (oldSocket && oldSocket !== socket.id) {
        this.emit(
          'error',
          new Error(`Service ${service} is already attached to ${oldSocket}`)
        );
      } else {
        console.log('Attach: %s => %s', service, socket.id);
        this._attached.set(service, socket.id);
        this._server.emit('service_attach', service);
      }
    });
    socket.on('service_detach', (service: string) => {
      const oldSocket = this._attached.get(service);
      if (oldSocket === undefined) {
        this.emit('error', new Error(`Service ${service} is not attached`));
      } else if (oldSocket !== socket.id) {
        this.emit(
          'error',
          new Error(`Service ${service} is not attached to ${socket.id}`)
        );
      } else {
        this._attached.delete(service);
        this._subscribed.delete(service);
        console.log('Detach: %s => %s', service, socket.id);
        this._server.emit('service_detach', service);
      }
    });
    socket.on('service_event', (payload: XRPC.Event) => {
      const socketId = this._attached.get(payload.service!);
      if (socketId !== socket.id) {
        this.emit(
          'error',
          new Error(`Service ${payload.service} is not owned by ${socket.id}`)
        );
        return;
      }
      const subs = this._subscribed.get(payload.service!);
      if (subs) {
        for (const targetId of subs) {
          const target = this._server.connected[targetId];
          if (target) {
            console.log(
              'Event: %s::%s from %s to %s',
              payload.service,
              payload.name,
              socket.id,
              targetId
            );
            target.emit('service_event', payload);
          }
        }
      }
    });
    socket.on('service_request', (payload: XRPC.Request) => {
      const targetId = this._attached.get(payload.service!);
      const target = this._server.connected[targetId!];
      if (targetId && target) {
        this._requests.set(payload.id, socket.id);
        console.log(
          'Request: %s::%s from %s to %s',
          payload.service,
          payload.method,
          socket.id,
          targetId
        );
        target.emit('service_request', payload);
      }
    });
    socket.on('service_response', (payload: XRPC.Response) => {
      const targetId = this._requests.get(payload.id);
      const target = this._server.connected[targetId!];
      if (targetId && target) {
        console.log('Response: %s to %s', socket.id, targetId);
        target.emit('service_response', payload);
      }
    });
    socket.on('service_subscribe', (service: string) => {
      const targetId = this._attached.get(service);
      const target = this._server.connected[targetId!];
      let subs = this._subscribed.get(service);
      if (targetId && target) {
        if (!subs) {
          this._subscribed.set(service, (subs = new Set()));
          console.log(
            'Subscribe: %s from %s to %s',
            service,
            socket.id,
            targetId
          );
          target.emit('service_subscribe', service);
        }
        subs.add(socket.id);
      }
    });
    socket.on('service_unsubscribe', (service: string) => {
      const targetId = this._attached.get(service);
      const target = this._server.connected[targetId!];
      const subs = this._subscribed.get(service);
      if (targetId && target && subs) {
        subs.delete(socket.id);
        if (subs.size === 0) {
          this._subscribed.delete(service);
          console.log(
            'Unsubscribe: %s from %s to %s',
            service,
            socket.id,
            targetId
          );
          target.emit('service_unsubscribe', service);
        }
      }
    });
    socket.on('disconnect', () => this._onSocketDisconnect(socket));
  };

  private readonly _onSocketDisconnect = (socket: IO.Socket): void => {
    console.log('Disconnect: %s', socket.id);
    socket.removeAllListeners();
    for (const [service, socketId] of this._attached) {
      if (socketId === socket.id) {
        this._server.emit('service_detach', service);
        this._attached.delete(service);
        this._subscribed.delete(service);
      }
    }
    for (const [messageId, socketId] of this._requests) {
      if (socketId === socket.id) {
        this._requests.delete(messageId);
      }
    }
    for (const [service, subs] of this._subscribed) {
      subs.delete(socket.id);
      if (subs.size === 0) {
        this._server.emit('service_unsubscribe', service);
        this._subscribed.delete(service);
      }
    }
  };

  private readonly _addSocketListener = (
    event: string,
    callback: (...args: any[]) => void
  ): void => {
    this._server.on(event, callback);
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
        this._server.removeListener(event, callback);
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
        this._server.removeListener(event, callback);
        this._listeners.splice(index, 1);
      }
    }
  };

  private readonly _removeSocketListeners = (): void => {
    const listeners = this._listeners.splice(0, this._listeners.length);
    for (const { event, callback } of listeners) {
      this._server.removeListener(event, callback);
    }
  };

  public constructor(server: IO.Namespace) {
    super();
    console.log(`[${basename(__filename)}] Create switchboard.`);
    this._server = server;
    this._listeners = [];
    this._attached = new Map();
    this._subscribed = new Map();
    this._requests = new Map();
    this._addSocketListener('connect', this._onSocketConnect);
    this._addSocketListener('disconnect', this._onSocketDisconnect);
  }

  public stop() {
    for (const [id, socket] of Object.entries(this._server.connected)) {
      socket.removeAllListeners();
      socket.disconnect(true);
    }
    this._removeSocketListeners();
  }
}
