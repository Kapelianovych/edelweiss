import { ToTuple } from './core/utilities/to_tuple';
import { ToValues } from './core/utilities/to_values';
import { data, Data } from './core/reactive/data';

/**
 * Function that does some action with
 * emitted value.
 */
export interface Listener<A extends ReadonlyArray<unknown>> {
	(...values: A): void;
}

interface ListenerRecord {
	readonly keys: ReadonlyArray<string>;
	readonly listener: () => void;
}

export type Store<T extends object> = T & {
	readonly on: <P extends ReadonlyArray<keyof T>>(
		...properties: P
	) => (listener: Listener<ToValues<T, ToTuple<P>>>) => VoidFunction;
};

const getSubscribeFunction =
	<V extends ReadonlyArray<unknown>>(
		listeners: Array<ListenerRecord | undefined>,
		target: object,
		receiver: any,
	) =>
	(...keys: ReadonlyArray<string>) =>
	(listener: Listener<V>) => {
		const index = listeners.push({
			keys,
			listener: () =>
				listener(
					...(keys.map((key) =>
						Reflect.get(target, key, receiver),
					) as unknown as V),
				),
		});

		return () => (listeners[index - 1] = undefined);
	};

const triggerUpdate = (
	listeners: Array<ListenerRecord | undefined>,
	property: string,
): void =>
	listeners
		.filter((record) => record !== undefined && record.keys.includes(property))
		.forEach((record) => record!.listener());

/** Creates reactive store. */
export const store = <S extends object>(object: S): Store<S> => {
	const listeners: Array<ListenerRecord | undefined> = [];

	return new Proxy(object as Store<S>, {
		get: (target, property: string, receiver) =>
			property === 'on'
				? getSubscribeFunction(listeners, target, receiver)
				: Reflect.get(target, property, receiver),
		set: (target, property: string, value, receiver) => {
			if (!Object.is(value, Reflect.get(target, property, receiver))) {
				Reflect.set(target, property, value, receiver);
				triggerUpdate(listeners, property);
			}

			return true;
		},
		deleteProperty: (target, property: string) => {
			if (Reflect.has(target, property)) {
				Reflect.deleteProperty(target, property);
				triggerUpdate(listeners, property);
			}

			return true;
		},
	});
};

/** Reactive pointer to specific fiels in store. */
export interface Pointer<S extends object> {
	<K extends keyof S>(key: K): Data<S[K]>;
	<K extends keyof S, A>(
		key: K,
		getter: (state: S[K]) => A,
		setter: (current: S[K], value: A) => S[K],
	): Data<A>;
}

/** Creates reactive pointer(getter/setter) of a value from a store. */
export const createPointer =
	<T extends object>(store: Store<T>): Pointer<T> =>
	<K extends keyof T, A>(
		key: K,
		getter: (state: T[K]) => A | T[K] = (x) => x,
		setter: (state: T[K], value: A) => A | T[K] = (_, x) => x,
	): Data<A> => {
		const state = data(getter(store[key]));

		store.on(key)((value) => state(getter(value)));

		return ((value) =>
			value === undefined
				? state()
				: void (store[key] = setter(
						store[key],
						value,
				  ) as Store<T>[K])) as Data<A>;
	};
