import { currentlyTracked } from './untrack';
import { stoppedTime, updateQueue } from './batch';
import {
	InnerEffect,
	currentEffect,
	parentEffects,
	endCurrentEffect,
	registerEffectAsCurrent,
} from './global';

export interface Data<T> {
	(): T;
	(value: T): void;
}

/** Cleans up the current effect and all deep children. */
const cleanupEffect = (effect: InnerEffect): void => {
	// All child effects should be deleted on every iteration.
	// The parent effect will register new ones after it.
	effect.children.forEach((child) => {
		cleanupEffect(child);
		// It is needed to signal all dependent data's to remove
		// the child effect.
		child.disposed = true;
	});
	effect.children.length = 0;

	// We should cleanup previous state of running effect.
	// There is no need to dispose a top-level effect
	// (from the data's perspective) because it will never
	// be flushed out of memory.
	effect.cleanups.forEach((fn) => fn());
	effect.cleanups.length = 0;
};

const update = (listeners: Set<InnerEffect>): void =>
	listeners.forEach((effect) => {
		// Only active effects should be executed and already disposed
		// effects will be removed on the next pull of the data's value.
		if (!effect.disposed) {
			cleanupEffect(effect);

			registerEffectAsCurrent(effect);
			effect();
			endCurrentEffect();
		}
	});

/** Creates reactive container for data. */
export const data = <T>(initial: T): Data<T> => {
	const id = Symbol();
	const listeners: Set<InnerEffect> = new Set();
	let currentValue: T = initial;

	const triggerUpdateWith = (nextValue: T): void => {
		currentValue = nextValue;
		update(listeners);
	};

	return ((value) => {
		if (value === undefined) {
			listeners
				// Effects are disposed right before new subscription.
				.forEach((effect) => effect.disposed && listeners.delete(effect));

			if (currentlyTracked) {
				const effect = currentEffect();

				if (
					effect !== null &&
					!parentEffects().some((effect) => listeners.has(effect))
				) {
					listeners.add(effect);
				}
			}

			return currentValue;
		} else {
			// Only a distinct value will cause an update.
			if (!Object.is(currentValue, value)) {
				stoppedTime
					? updateQueue.set(id, () => triggerUpdateWith(value))
					: triggerUpdateWith(value);
			}
		}
	}) as Data<T>;
};
