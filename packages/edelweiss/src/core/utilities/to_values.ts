export type ToValues<
	O extends object,
	K extends ReadonlyArray<keyof O>,
	V extends ReadonlyArray<unknown> = [],
> = K['length'] extends 0
	? V
	: ToValues<O, K extends [any, ...infer T] ? T : [], [...V, O[K[0]]]>;
