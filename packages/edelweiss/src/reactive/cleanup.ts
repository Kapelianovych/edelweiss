import { currentEffect } from './global';

/** Registers a cleanup function for the currently invoked effect. */
export const cleanup = (fn: VoidFunction): void => {
	const effect = currentEffect();

	if (effect !== null) {
		effect.cleanup = fn;
	}
};
