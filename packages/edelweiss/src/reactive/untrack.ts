import type { Data } from './data';

/**
 * Signals if a currently invoked `data` should
 * track effects that are dependent from it.
 * By default, all `data`s are tracked.
 */
export let currentlyTracked = true;

/**
 * Defines a scope that prevents a current effect
 * containers from tracking any `data` inside it.
 */
export const untrack = <T>(fn: (() => T) | Data<T>): T => {
	currentlyTracked = false;
	const result = fn();
	currentlyTracked = true;
	return result;
};
