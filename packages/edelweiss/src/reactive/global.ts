export interface Effect {
	(): void;
}

/** Function that has `data` variables inside. */
export interface Computed<T> {
	(): T;
}

export interface InnerEffect extends Effect {
	readonly owners: symbol[];
	readonly children: InnerEffect[];
	cleanup?: VoidFunction;
	disposed: boolean;
}

interface GetSetEffect {
	(): InnerEffect | null;
	(effect: InnerEffect | null): void;
}

let currentlyInitializedEffect: InnerEffect | null = null;

let currentlyRunningEffect: InnerEffect | null = null;

export const runningEffect = ((effect?: InnerEffect | null) =>
	effect === undefined
		? currentlyRunningEffect
		: void (currentlyRunningEffect = effect)) as GetSetEffect;

export const initializedEffect = ((effect?: InnerEffect | null) =>
	effect === undefined
		? currentlyInitializedEffect
		: void (currentlyInitializedEffect = effect)) as GetSetEffect;
