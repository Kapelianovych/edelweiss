export const updateQueue: Set<VoidFunction> = new Set();

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
