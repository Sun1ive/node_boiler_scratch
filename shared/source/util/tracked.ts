import { EventEmitter } from 'events';
import { NameSpace } from './name.space';

const _internal: Map<EventEmitter, WeakMap<EventEmitter, Map<string, any>>> = new Map();
const _meta: Map<EventEmitter, Set<string>> = new Map();
const _suppressed: Set<EventEmitter> = new Set();

function getContainer(proto: EventEmitter, instance: EventEmitter): Map<string, any> {
	var protoContainer = _internal.get(proto);
	if (!protoContainer) {
		_internal.set(proto, protoContainer = new WeakMap());
	}
	var instanceContainer = protoContainer.get(instance);
	if (!instanceContainer) {
		protoContainer.set(instance, instanceContainer = new Map());
	}
	return instanceContainer;
}

function getMeta(proto: EventEmitter): Set<string> {
	var meta = _meta.get(proto);
	if (!meta) {
		_meta.set(proto, meta = new Set());
	}
	return meta;
}

function defaultPropertySignalName(propertyKey: string): string {
	return propertyKey + 'Changed';
}

export function tracked(
	commonSignalName: string | null = 'PropertiesChanged',
	propertySignalNameFactory: ((propertyKey: string) => string | undefined) | null = defaultPropertySignalName,
) {
	return function (proto: EventEmitter, propertyKey: string, descriptor?: PropertyDescriptor) {
		var meta = getMeta(proto);
		var signalName = typeof propertySignalNameFactory === 'function' ? propertySignalNameFactory(propertyKey) : undefined;
		var proxyGetter = function (this: EventEmitter) {
			var container = getContainer(proto, this);
			return container.get(propertyKey);
		};
		var proxySetter = function (this: EventEmitter, value: any) {
			var container = getContainer(proto, this);
			var oldValue = container.get(propertyKey);
			var suppressed = _suppressed.has(this);
			if (oldValue !== value) {
				container.set(propertyKey, value);
				if (!suppressed && typeof signalName === 'string') {
					this.emit(signalName, value);
				}
				if (!suppressed && typeof commonSignalName === 'string') {
					if (value !== undefined) {
						this.emit(commonSignalName, { [propertyKey]: value }, []);
					} else {
						this.emit(commonSignalName, {}, [propertyKey]);
					}
				}
			}
		};

		if (descriptor === undefined) {
			descriptor = {
				get: proxyGetter,
				set: proxySetter,
				configurable: false,
				enumerable: true,
			};
			Object.defineProperty(proto, propertyKey, descriptor);
			meta.add(propertyKey);
		} else {
			if (descriptor.set) {
				var setter = descriptor.set;
				descriptor.set = function (this: EventEmitter, value) {
					setter.call(this, value);
					proxySetter.call(this, value);
				};
				descriptor.enumerable = true;
				meta.add(propertyKey);
			} else if (descriptor.get) {
				// do nothing: only getter found ==> readonly property
			} else {
				// do nothing: only value found ==> prototype property
			}
		}
	}
}

export function getProperties(instance: EventEmitter, ...names: string[]): NameSpace {
	const result: NameSpace = {};
	const proto = Object.getPrototypeOf(instance);
	const meta = getMeta(proto);
	if (names.length === 0) {
		for (let name of meta) {
			result[name] = (instance as any)[name];
		}
	} else {
		for (let name of names) {
			if (meta.has(name)) {
				result[name] = (instance as any)[name];
			}
		}
	}
	return result;
}

export function setProperties(instance: EventEmitter, props: Readonly<NameSpace>) {
	const proto = Object.getPrototypeOf(instance);
	const meta = getMeta(proto);
	for (let [name, value] of Object.entries(props)) {
		if (meta.has(name)) {
			(instance as any)[name] = value;
		}
	}
}

export function suppressTracked(target: EventEmitter) {
	_suppressed.add(target);
}

export function restoreTracked(target: EventEmitter) {
	_suppressed.delete(target);
}

// if (require.main === module) {
//     class Test2 extends EventEmitter {
//         @tracked()
//         public value: string;
//
//         @tracked()
//         public value2: string;
//
//         toJSON() {
//             return {
//                 value: this.value,
//                 value2: this.value2,
//             };
//         }
//     }
//
//     class Test extends EventEmitter {
//         private _oldTest2?: Test2;
//
//         @tracked()
//         test2: Test2;
//
//         private _onTest2PropertiesChanged = () => {
//             this.emit('PropertiesChanged', { test2: this._oldTest2 }, []);
//             this.emit('test2Changed', this._oldTest2);
//         };
//
//         private _rebindTest2 = (newValue: Test2) => {
//             if (newValue !== this._oldTest2) {
//                 if (this._oldTest2) {
//                     this._oldTest2.removeListener('PropertiesChanged', this._onTest2PropertiesChanged);
//                 }
//                 this._oldTest2 = newValue;
//                 newValue.on('PropertiesChanged', this._onTest2PropertiesChanged);
//             }
//         };
//
//         public constructor() {
//             super();
//             this.on('test2Changed', this._rebindTest2);
//             this.test2 = new Test2();
//         }
//     }
//
//
//
//     const PROPS = 1024;
//     for (let i = 0; i !== PROPS; ++i) {
//         tracked()(Test.prototype, 'Property' + i);
//     }
//
//     const test = new Test();
//
//     var _changed: { [name: string]: any } = {};
//     var _dropped: Set<string> = new Set();
//     let timeout: NodeJS.Timer | undefined;
//
//     function emitChanges() {
//         timeout = undefined;
//         console.log('on(PropertiesChanged): Changed: %j, Dropped: %j', _changed, Array.from(_dropped));
//         console.timeEnd('Setting');
//         _changed = {};
//         _dropped = new Set();
//     }
//
//     test.on('PropertiesChanged', function (changed, droppped) {
//         for (let name of Object.keys(changed)) {
//             _dropped.deleteValue(name);
//         }
//         Object.assign(_changed, changed);
//         for (let name of droppped) {
//             _dropped.addValue(name);
//         }
//         if (!timeout) {
//             timeout = setTimeout(emitChanges, 0);
//         }
//         // console.log('on(PropertiesChanged): Changed: %j, Dropped: %j', changed, droppped);
//     });
//
//
//     console.time('Setting');
//     for (let c = 0; c !== 100000; ++c) {
//         const i = Math.floor(Math.random() * PROPS);
//         const newValue = Math.floor(Math.random() * 100);
//         (test as any)['Property' + i] = newValue % 2 === 0 ? undefined : newValue;
//     }
//
//     // test.test2.value = 'newValue';
//     // test.test2.value = 'newValue2';
//     // test.test2.value2 = '111111';
// }
