import {
	Effect,
	InnerEffect,
	endCurrentEffect,
	registerEffectAsCurrent,
} from './global';

/**
 * Defines an effect to be performed on
 * every update of `Data` container that
 * is used inside that effect.
 */
export const effect = (fn: Effect): void => {
	// ETA abstraction is needed to add required fields
	// to the effect and don't impact user-provided function.
	const innerEffect = () => fn();

	innerEffect.disposed = false;
	innerEffect.children = [] as InnerEffect[];
	innerEffect.cleanups = [] as VoidFunction[];

	registerEffectAsCurrent(innerEffect);
	innerEffect();
	endCurrentEffect();
};
