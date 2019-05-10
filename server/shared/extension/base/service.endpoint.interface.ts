// tslint:disable
import { EventEmitter } from 'events';
import { XRPC } from '../../schemas/x-rpc.schema';
import { NameSpace } from '../../util/name.space';
import { IExtension } from './extension.interface';

/**
 * Базовый интерфейс конечной точки
 */
export interface IServiceEndpoint extends EventEmitter {
  /**
   * Идентфикатор "сервиса", который реализует конечная точка
   */
  readonly service: string;

  /**
   * Расширение к которому подключена конечная точка
   */
  extension: IExtension | null;

  /**
   * "Сборщик"/"группировщик" событий
   */
  readonly eventCollector: Map<
    string,
    | boolean
    | ((event: string, old: any[] | undefined, next: any[]) => any[] | boolean)
  >;

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
  set(props: Readonly<NameSpace>): void;

  /**
   * Вызывает обработчик указанного метода с параметрами
   * @param {string} method
   * @param {XRPC.Params} params
   */
  handle(method: string, params: XRPC.Params): Promise<any>;

  /**
   * Принудительно "выбрасывает" накопленные события
   */
  flush(): void;

  /**
   * Конечная точка подключена к системе
   */
  addListener(event: 'attach', listener: () => void): this;
  on(event: 'attach', listener: () => void): this;
  once(event: 'attach', listener: () => void): this;
  prependListener(event: 'attach', listener: () => void): this;
  prependOnceListener(event: 'attach', listener: () => void): this;
  removeListener(event: 'attach', listener: () => void): this;

  /**
   * Конечная точка отключена от системы
   */
  addListener(event: 'detach', listener: () => void): this;
  on(event: 'detach', listener: () => void): this;
  once(event: 'detach', listener: () => void): this;
  prependListener(event: 'detach', listener: () => void): this;
  prependOnceListener(event: 'detach', listener: () => void): this;
  removeListener(event: 'detach', listener: () => void): this;

  /**
   * Свойства конечной точки были обновлены
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
  emit(
    event: 'PropertiesChanged',
    changed: Readonly<NameSpace>,
    dropped: ReadonlyArray<string>
  ): boolean;

  addListener(event: string, listener: (...args: any[]) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  removeListener(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}
