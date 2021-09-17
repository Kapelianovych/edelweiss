import { initializedEffect, runningEffect } from './global';

/** Registers cleanup function for currently invoked effect. */
export const cleanup = (fn: VoidFunction): void => {
	if (initializedEffect() !== null) {
		initializedEffect()!.cleanup = fn;
	} else if (runningEffect() !== null) {
		runningEffect()!.cleanup = fn;
	}
};
