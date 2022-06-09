import type { Data } from './data';

/**
 * Signals if a currently invoked `data` should
 * track effects that are dependent from it.
 * By default, all `data`s are tracked.
 */
export let currentlyTracked = true;

/** Prevent an effect to be dependent from a `data`. */
export const untrack = <T>(fn: Data<T>): T => {
	currentlyTracked = false;
	const result = fn();
	currentlyTracked = true;
	return result;
};
