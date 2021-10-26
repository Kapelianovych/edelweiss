import {
	Effect,
	InnerEffect,
	runningEffect,
	initializedEffect,
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

	innerEffect.owners = [] as symbol[];
	innerEffect.children = [] as InnerEffect[];
	innerEffect.disposed = false;

	// If there is a root effect or a running effect, then we
	// should add the current effect to them as a child.
	(initializedEffect() ?? runningEffect())?.children.push(innerEffect);

	// Effect can be invoked inside another effect,
	// so we should preserve the parent effect.
	const parentEffect = initializedEffect();

	initializedEffect(innerEffect);
	innerEffect();
	initializedEffect(parentEffect);
};
