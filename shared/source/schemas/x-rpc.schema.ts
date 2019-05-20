import { Common } from './common.schema';

/**
 * Базовые типы данных для обмена данными между составными частями системы
 */
export declare namespace XRPC {
  /**
   * Корректный значимый идентификатор сообщения - строка или число
   */
  export type MessageId = string | number;

  /**
   * Имя метода/события из пространства ядра
   * @pattern ^[^:]+$
   */
  export type SimpleName = string;

  /**
   * Аргументы запроса / Параметры события - объект
   */
  export type Params = { [k: string]: any };

  /**
   * Объект ошибки
   */
  export interface ErrorObject {
    /**
     * Текстовый код ошибки
     */
    name: SimpleName;

    /**
     * Числовой код ошибки
     */
    code: string;

    /**
     * Текстовое сообщение ошибки
     */
    message: string;

    /**
     * Расширенный код ошибки
     */
    extendedCode?: number;

    /**
     * Дополнительные параметры
     */
    data?: Params;
  }

  /**
   * Атомарное сообщение
   * Должно состоять, как минимум из поля `id`
   */
  export interface Message {
    /**
     * В качестве идентификатора допускается либо корретный строковый UUID4, либо NULL
     */
    id: MessageId | null;
  }

  /**
   * Событие
   * Использует NULL в поле `id`, не требует ответа
   */
  export interface Event extends Message {
    /**
     * Идентификатор сообщения - NULL
     */
    id: null;

    /**
     * Идентификатор сервиса, которому адресовано сообщение
     */
    service: string | null;

    /**
     * Имя события
     */
    name: string;

    /**
     * Дополнительные параметры события
     */
    params: any[];
  }

  /**
   * Событие ядра
   * Использует NULL в поле `stock`
   */
  export interface CoreEvent extends Event {
    name: string;
  }

  /**
   * Запрос
   * Использует корректный UUID4 в поле `id`, требует ответа с идентичным полем `id`
   * Может также иметь поле `valid_until`, в котором указывается максимальное время, до которого нужно получить ответ
   */
  export interface Request extends Message {
    /**
     * Идентификатор сообщения
     */
    id: MessageId;

    /**
     * Идентификатор сервиса, которому адресовано сообщение
     */
    service: string | null;

    /**
     * Название метода сервиса
     */
    method: string;

    /**
     * Аргументы запроса
     */
    params: Params;

    /**
     * Максимальная дата, до которой запрос/ответ считается валидным
     */
    valid_until?: Common.UnixTimeStamp;
  }

  /**
   * Запрос с ограничением по времени
   */
  export interface TimedRequest extends Request {
    valid_until: Common.UnixTimeStamp;
  }

  /**
   * Успешный/положительный ответ
   */
  export interface SuccessResponse extends Message {
    /**
     * Идентификатор ответа.
     * Должен совпадать с идентификатором запроса
     */
    id: MessageId;

    /**
     * Результат
     */
    result?: any;
  }

  /**
   * Ошибочный/отрицательный ответ
   */
  export interface ErrorResponse extends Message {
    /**
     * Идентификатор ответа.
     * Должен совпадать с идентификатором запроса.
     */
    id: MessageId;

    /**
     * Объект ошибки
     */
    error: ErrorObject;
  }

  /**
   * Ответ
   */
  export type Response = SuccessResponse | ErrorResponse;
}
