import { initializedEffect, runningEffect } from './global';

/** Registers cleanup function for currently invoked effect. */
export const cleanup = (fn: VoidFunction): void => {
	const effect = initializedEffect() ?? runningEffect();

	if (effect !== null) {
		effect.cleanup = fn;
	}
};
