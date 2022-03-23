import { data } from './reactive/data';
import { untrack } from './reactive/untrack';

export interface Resource<T, K> {
	/**
	 * Gets current resource value.
	 * You can provide _dependency_ to the _future_
	 * function.
	 *
	 * If the _future_ contains no dependency, then
	 * the resource will be loaded only once.
	 */
	(dependency?: K): T;
	/**
	 * If fetching resource is failed, this functions will
	 * return a reason of the fail.
	 */
	readonly error: () => Error | undefined;
	/** Signals if resource is loading. */
	readonly loading: () => boolean;
}

/** Loads asynchronous resources. */
export const lazy = <T, K = unknown>(
	future: (dependency?: K) => Promise<T>,
	fallback: T,
): Resource<T, K> => {
	const error = data<Error | undefined>(undefined);
	const value = data(fallback);
	const loading = data(false);

	const fn = (dependency?: K) => {
		if (
			!untrack(loading) &&
			(Object.is(value(), fallback) ||
				(dependency !== undefined && future.length > 0))
		) {
			loading(true);

			future(dependency)
				.then(value, (_error: Error) => {
					error(_error);
					value(fallback);
				})
				.finally(() => loading(false));
		}

		return value();
	};

	Reflect.defineProperty(fn, 'error', {
		value: () => error(),
		writable: false,
		enumerable: true,
		configurable: false,
	});

	Reflect.defineProperty(fn, 'loading', {
		value: () => loading(),
		writable: false,
		enumerable: true,
		configurable: false,
	});

	return fn as Resource<T, K>;
};
