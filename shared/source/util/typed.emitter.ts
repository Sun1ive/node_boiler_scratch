// tslint:disable
import { EventEmitter } from "events";
import { NameSpace } from './name.space';

export interface TypedEmitter<EventsType extends NameSpace<any[]>>
  extends EventEmitter {
  addListener<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  on<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  once<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  prependListener<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  prependOnceListener<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  removeListener<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  off<Event extends keyof EventsType>(
    event: Event,
    listener: (...args: EventsType[Event]) => void
  ): this;
  emit<Event extends keyof EventsType>(
    event: Event,
    ...args: EventsType[Event]
  ): boolean;

  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  emit(event: string | symbol, ...args: any[]): boolean;
}
