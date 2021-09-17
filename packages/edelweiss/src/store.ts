import { ToTuple } from './core/utilities/to_tuple';
import { ToValues } from './core/utilities/to_values';

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

		return () => void (listeners[index - 1] = undefined);
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
