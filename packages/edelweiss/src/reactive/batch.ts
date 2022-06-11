/**
 * Holds deferred updates of the containers.
 *
 * Every queued update have to be associated with a last value
 * of the specific `data` container only.
 */
export const updateQueue: Map<symbol, VoidFunction> = new Map();

export let stoppedTime = false;

/**
 * Waits for all computations to be done and
 * updates all `data`s together.
 */
export const batch = (fn: VoidFunction): void => {
	stoppedTime = true;
	fn();
	stoppedTime = false;
	updateQueue.forEach((update) => update());
	updateQueue.clear();
};
