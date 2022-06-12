import { currentEffect } from './global';

/** Registers a cleanup function for the currently invoked effect. */
export const cleanup = (fn: VoidFunction): void =>
	void currentEffect()?.cleanups.push(fn);
