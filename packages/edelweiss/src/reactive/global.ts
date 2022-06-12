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

/** Returns a current (running) effect. */
export const currentEffect = (): InnerEffect | null => effects.at(-1) ?? null;

/**
 * Sets an _effect_ as the current (running) effect.
 *
 * If there is a running effect already, then it registers the _effect_
 * as its child.
 */
export const registerEffectAsCurrent = (effect: InnerEffect): void => {
	currentEffect()?.children.push(effect);

	effects.push(effect);
};

/**
 * Pops out the current effect from the global tracking list
 * and sets the parent effect as currently running.
 */
export const endCurrentEffect = (): void => void effects.pop();
