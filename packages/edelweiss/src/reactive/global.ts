export interface Effect {
	(): void;
}

/** Function that has `data` variables inside. */
export interface Computed<T> {
	(): T;
}

export interface InnerEffect extends Effect {
	disposed: boolean;
	readonly children: InnerEffect[];
	readonly cleanups: VoidFunction[];
}

/**
 * The ordered list of the effects.
 *
 * A first effect is the top-level one. The last
 * effect is a child of an effect at previous index.
 */
const effects: InnerEffect[] = [];

/** Returns parents of the current effect. */
export const parentEffects = (): readonly InnerEffect[] => effects.slice(0, -1);

/** Returns a current (running) effect. */
export const currentEffect = (): InnerEffect | null => effects.at(-1) ?? null;

/**
 * Sets an _effect_ as the current (running) effect.
 *
 * @param maybeChild - signals if the _effect_ may be inside another
 * effect and therefore the it should be registered as a child.
 * By default, the function registers an independent effect.
 */
export const registerEffectAsCurrent = (
	effect: InnerEffect,
	maybeChild = false,
): void => {
	if (maybeChild) {
		currentEffect()?.children.push(effect);
	}

	effects.push(effect);
};

/**
 * Pops out the current effect from the global tracking list
 * and sets the parent effect as currently running.
 */
export const endCurrentEffect = (): void => void effects.pop();
