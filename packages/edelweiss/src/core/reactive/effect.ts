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
	if ((fn as InnerEffect).children === undefined) {
		Reflect.defineProperty(fn, 'children', {
			value: [],
			writable: false,
			enumerable: false,
			configurable: false,
		});
	}

	if ((fn as InnerEffect).disposed === undefined) {
		Reflect.defineProperty(fn, 'disposed', {
			value: false,
			writable: true,
			enumerable: false,
			configurable: false,
		});
	}

	if ((fn as InnerEffect).dataDependencies === undefined) {
		Reflect.defineProperty(fn, 'dataDependencies', {
			value: [],
			writable: false,
			enumerable: false,
			configurable: false,
		});
	}

	// If there is root effect or running effect, then we
	// should add current effect to them as a child.
	(initializedEffect() ?? runningEffect())?.children.push(fn as InnerEffect);

	// Effect can be invoked inside another effect,
	// so we should preserve parent effect.
	const parentEffect = initializedEffect();

	initializedEffect(fn as InnerEffect);
	fn();
	initializedEffect(parentEffect);
};
