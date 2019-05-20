// tslint:disable
import { EventEmitter } from 'events';
import { XRPC } from '../../schemas/x-rpc.schema';
import { NameSpace } from '../../util/name.space';
import { IExtension } from './extension.interface';

export interface IRemoteCallOption {
  timeout: number;
  waitForAttach: boolean;
}

/**
 * Базовый интерфейс обьекта "прокси"
 */
export interface IServiceProxy extends EventEmitter {
  /**
   * Идентфикатор "сервиса", который реализует конечная точка
   */
  readonly service: string;

  /**
   * Расширение к которому подключена конечная точка
   */
  extension: IExtension | null;

  /**
   * Возвращает объект со значениями указанных в параметрах свойств
   * Если список свойст пустой, возвращается обьект со значениями всех отслеживаемых свойств
   * @param {string[]} [names]
   * @returns {NameSpace}
   */
  get(...names: string[]): NameSpace;

  /**
   * Обновляет значения указанных в параметре props свойств
   * @param {Readonly<NameSpace>} props
   */
  set(props: Readonly<NameSpace>, external?: boolean): void;

  /**
   * Запрашивает вызов метода с параметрами
   * @param {string} method
   * @param {XRPC.Params} params
   */
  call(
    method: string,
    params: XRPC.Params,
    options?: Partial<IRemoteCallOption>
  ): Promise<any>;

  /**
   * Запрашиваемая служба покдлючена к системе и доступна
   */
  addListener(event: 'attach', listener: () => void): this;
  on(event: 'attach', listener: () => void): this;
  once(event: 'attach', listener: () => void): this;
  prependListener(event: 'attach', listener: () => void): this;
  prependOnceListener(event: 'attach', listener: () => void): this;
  removeListener(event: 'attach', listener: () => void): this;

  /**
   * Запрашиваемая служба отключена от системы
   */
  addListener(event: 'detach', listener: () => void): this;
  on(event: 'detach', listener: () => void): this;
  once(event: 'detach', listener: () => void): this;
  prependListener(event: 'detach', listener: () => void): this;
  prependOnceListener(event: 'detach', listener: () => void): this;
  removeListener(event: 'detach', listener: () => void): this;

  /**
   * Свойства запрашиваемой службы были изменены
   */
  addListener(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;
  on(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;
  once(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;
  prependListener(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;
  prependOnceListener(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;
  removeListener(
    event: 'PropertiesChanged',
    listener: (
      changed: Readonly<NameSpace>,
      dropped: ReadonlyArray<string>
    ) => void
  ): this;

  addListener(event: string, listener: (...args: any[]) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  removeListener(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}
