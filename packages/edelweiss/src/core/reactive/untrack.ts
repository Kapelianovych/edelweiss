import type { Data } from './data';

/**
 * Signals if currently invoked `data` should
 * track effects that are dependent from it.
 * By default, all `data`s is tracked.
 */
export let currentlyTracked = true;

/** Prevent effect to be dependent from `data`. */
export const untrack = <T>(fn: Data<T>): T => {
	currentlyTracked = false;
	const result = fn();
	currentlyTracked = true;
	return result;
};
