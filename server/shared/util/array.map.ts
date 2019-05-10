// tslint:disable
function itemSelector<KeyType, ValueType>(
  key: KeyType,
  map: (value: ValueType) => KeyType
): (value: ValueType) => boolean {
  return (value: ValueType) => Object.is(map(value), key);
}

export class ArrayMap<KeyType, ValueType> implements Map<KeyType, ValueType> {
  private readonly _values: ValueType[];
  private readonly _map: (value: ValueType) => KeyType;

  public constructor(
    values: Iterable<ValueType>,
    mapper: (value: ValueType) => KeyType
  ) {
    this._values = Array.from(values);
    this._map = mapper;
  }

  public addValue(value: ValueType): this {
    this._values.push(value);
    return this;
  }

  public deleteValue(value: ValueType): boolean {
    var index = this._values.indexOf(value);
    if (index >= 0) {
      this._values.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  public clear(): void {
    this._values.splice(0, this._values.length);
  }

  public forEach(
    callbackfn: (
      value: ValueType,
      key: KeyType,
      map: Map<KeyType, ValueType>
    ) => void,
    thisArg?: any
  ): void {
    this._values.forEach(value => {
      callbackfn.call(thisArg, value, this._map(value), this);
    });
  }

  public [Symbol.iterator](): IterableIterator<[KeyType, ValueType]> {
    return this.entries();
  }

  public [Symbol.toStringTag] = '[object ArrayMap]';

  public get(key: KeyType): ValueType | undefined {
    return this._values.find(itemSelector(key, this._map));
  }

  public set(key: KeyType, value: ValueType): this {
    if (!itemSelector(key, this._map)(value)) {
      throw new Error('Invalid key');
    }
    this.delete(key);
    this.addValue(value);
    return this;
  }

  public has(key: KeyType): boolean {
    return this._values.findIndex(itemSelector(key, this._map)) >= 0;
  }

  public delete(key: KeyType): boolean {
    var index = this._values.findIndex(itemSelector(key, this._map));
    if (index >= 0) {
      this._values.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  public get size(): number {
    return this._values.length;
  }

  public *entries(): IterableIterator<[KeyType, ValueType]> {
    for (let value of this._values) {
      yield [this._map(value), value];
    }
  }

  public *keys(): IterableIterator<KeyType> {
    for (let value of this._values) {
      yield this._map(value);
    }
  }

  public values(): IterableIterator<ValueType> {
    return this._values[Symbol.iterator]();
  }
}
