type Call<A extends readonly unknown[], R> = {
	readonly args: A;
	readonly return: R;
};

export type Spy<
	T extends (this: any, ...args: readonly any[]) => unknown = VoidFunction,
> = T & { readonly calls: readonly Call<Parameters<T>, ReturnType<T>>[] };

/** Spies on the function calls. */
export const spy = <
	T extends (this: any, ...args: readonly any[]) => unknown = VoidFunction,
>(
	fn: T = (() => void 0) as T,
): Spy<T> => {
	const calls: Call<Parameters<T>, ReturnType<T>>[] = [];

	const wrapped = function (
		this: ThisParameterType<T>,
		...args: Parameters<T>
	) {
		const result = fn.apply(this, args) as ReturnType<T>;
		calls.push({ args, return: result });
		return result;
	};

	wrapped.calls = calls;

	Reflect.defineProperty(wrapped, 'length', { value: fn.length });

	return wrapped as unknown as Spy<T>;
};
