import { currentlyTracked } from './untrack';
import { stoppedTime, updateQueue } from './batch';
import { initializedEffect, InnerEffect, runningEffect } from './global';

export interface Data<T> {
	(): T;
	(value: T): void;
}

const update = (dataId: symbol, listeners: InnerEffect[]): void =>
	listeners
		.filter(
			(effect) =>
				// Only known effects and those that don't need to be
				// disposed should be invoked.
				// It is needed in situations when data is used
				// only in effect that is disposed. In that case
				// getter never invokes and cannot dispose effect.
				effect.dataDependencies.includes(dataId) && !effect.disposed,
		)
		.forEach((effect) => {
			// All child effects should be deleted on every iteration. Parent effect will register new ones after it.
			effect.children.forEach((child) => {
				child.cleanup?.();
				child.disposed = true;
			});
			effect.children.length = 0;
			// Before executing an effect we should clear
			// all data dependencies of the effect.
			// Because of this we can count all data dependencies
			// that are invoked inside (dependency is registered
			// in data getter).
			effect.dataDependencies.length = 0;
			// We should cleanup previous state of running effect.
			effect.cleanup?.();

			runningEffect(effect);
			effect();
			runningEffect(null);
		});

/** Creates reactive container for data. */
export const data = <T>(initial: T): Data<T> => {
	const id = Symbol();
	let listeners: InnerEffect[] = [];
	let currentValue: T = initial;

	const triggerUpdateWith = (nextValue: T): void => {
		currentValue = nextValue;
		update(id, listeners);
	};

	return ((value) => {
		if (value === undefined) {
			listeners = listeners.filter(
				(effect) =>
					// Effects are disposed right before new subscription.
					!effect.disposed,
			);

			if (currentlyTracked) {
				const effect = initializedEffect() ?? runningEffect();

				if (effect !== null) {
					effect.dataDependencies.push(id);

					if (!listeners.includes(effect)) {
						listeners.push(effect);
					}
				}
			}

			return currentValue;
		} else {
			// Only a distinct value will cause an update.
			if (currentValue !== value) {
				stoppedTime
					? updateQueue.set(id, () => triggerUpdateWith(value))
					: triggerUpdateWith(value);
			}
		}
	}) as Data<T>;
};
