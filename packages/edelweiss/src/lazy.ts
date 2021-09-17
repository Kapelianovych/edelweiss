import { data } from './core/reactive/data';

export interface Resource<T> {
	/**
	 * Gets current resource value. By default,
	 * resource is loaded only once, but you can
	 * change it by providing optional `shouldUpdate`
	 * function that receives current resource's value.
	 */
	(shouldUpdate?: (current: T) => boolean): T;
	/**
	 * If fetching resource is failed, this functions will
	 * return a reason of the fail.
	 */
	readonly error: () => Error | undefined;
	/** Signals if resource is loading. */
	readonly loading: () => boolean;
}

/** Loads asynchronous resources. */
export const lazy = <T>(future: () => Promise<T>, fallback: T): Resource<T> => {
	const error = data<Error | undefined>(undefined);
	const value = data(fallback);
	const loading = data(false);

	const fn = (shouldUpdate?: (current: T) => boolean) => {
		if (shouldUpdate?.(value()) ?? Object.is(value(), fallback)) {
			loading(true);

			future()
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
		enumerable: false,
		configurable: false,
	});

	Reflect.defineProperty(fn, 'loading', {
		value: () => loading(),
		writable: false,
		enumerable: false,
		configurable: false,
	});

	return fn as Resource<T>;
};
