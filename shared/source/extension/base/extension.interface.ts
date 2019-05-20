import { XRPC } from '../../schemas/x-rpc.schema';
import { ArrayMap } from '../../util/array.map';
import { NameSpace } from '../../util/name.space';
import { TypedEmitter } from '../../util/typed.emitter';
import { IServiceEndpoint } from './service.endpoint.interface';
import { IServiceProxy } from './service.proxy.interface';

// tslint:disable-next-line
interface ExtensionEventsMap extends NameSpace<any[]> {
  // Подключении новой реализации к системе
  service_attach: [string];
  // Отключении реализации от системы
  service_detach: [string];
  // Превышение времени выполнения запроса
  request_timeout: [XRPC.Request];
  // Расширение подключено к коммутатору
  connect: [];
  // Ошибка подключения к коммутатору
  connect_error: [Error];
  // Превышено время подключения к коммутатору
  connect_timeout: [number];
  // Ошибка обмена данными
  error: [Error];
  // Расширение отключено от коммутатора
  disconnect: [] | [Error];
  // Расширение переподключено к коммутатору
  reconnect: [number];
  // Попытка переподключения к коммутатору
  reconnect_attempt: [number];
  // Попытка переподключения к коммутатору
  reconnecting: [number];
  // Ошибка переподключения к коммутатору
  reconnect_error: [Error];
  // Попытка переподключения к коммутатору завершилась неудачей
  reconnect_failed: [];
}

/**
 * Интегрфейс расширения системы
 * Используется для подключения клиентов и реализаций служб системы
 */
export interface IExtension extends TypedEmitter<ExtensionEventsMap> {
  /**
   * Расширение подключено к системе
   */
  readonly ready: boolean;
  /**
   * Множество подключенных к системе служб, доступных для работы с данного расширения
   */
  readonly attached: ReadonlySet<string>;
  /**
   * Реестр обьектов "прокси", которые предоставляют клиенсткое API к службам системы
   */
  readonly proxies: ArrayMap<string, IServiceProxy>;
  /**
   * Реестр обьектов "конечных точек", которые реализуют API к служб системы
   */
  readonly endpoints: ArrayMap<string, IServiceEndpoint>;

  /**
   * "Сырой" вызов метода системы
   * @param {string} service - идентификатор службы системы
   * @param {string} method - наименование метода
   * @param {XRPC.Params} params - передаваемые параметры метода
   * @param {number} [timeout] - время в миллисекундах, по истечению которого будет автоматически возвращена ошибка
   */
  request(
    service: string,
    method: string,
    params: XRPC.Params,
    timeout?: number
  ): Promise<any>;

  /**
   * "Сырая" отправка события системы
   * @param {string} service - идентификатор службы системы
   * @param {string} name - наименование сигнала
   * @param params - параметры сигнала
   */
  publish(service: string, name: string, ...params: any[]): boolean;

  /**
   * Остановка и отключение расширения
   */
  stop(): void;
}
