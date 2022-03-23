export const isObject = <T extends object = object>(
	value: unknown,
): value is T => value !== null && typeof value === 'object';

export const isIterable = <T>(value: unknown): value is Iterable<T> =>
	isObject(value) && Symbol.iterator in value;

export const isFunction = <T>(value: unknown): value is () => T =>
	typeof value === 'function';
