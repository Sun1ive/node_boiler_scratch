/**
 * Общие типы данных
 */
export declare namespace Common {
    /**
     * Целое число
     * @TJS-type integer
     */
    export type Integer = number;

    /**
     * Неотрицательное целое число
     * @TJS-type integer
     * @minimum 0
     */
    export type PositiveInteger = number;
    
    /**
     * Универсальный уникальный идентификатор V4
     * @pattern ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$
     */
    export type UUID4 = string;
    
    /**
     * Метка времени в unix-подобных системах
     * @TJS-type integer
     * @minimum 0
     */
    export type UnixTimeStamp = PositiveInteger;
}
