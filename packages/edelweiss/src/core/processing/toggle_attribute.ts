import { effect } from '../reactive/effect';
import { markers } from '../html';
import { hydrated } from '../environment';
import { callHook, Hooks } from '../hooks';
import { TOGGLE_ATTRIBUTE_PREFIX } from '../constants';

const toggleAttribute = (
	target: Element,
	name: string,
	shouldAttributeBePresent: boolean,
) =>
	shouldAttributeBePresent
		? target.setAttribute(name, '')
		: target.removeAttribute(name);

export const processToggleAttribute = (
	currentNode: Element,
	name: string,
	value: string,
): void => {
	const marker = markers.get(value);

	if (marker !== undefined) {
		const attributeName = name.replace(TOGGLE_ATTRIBUTE_PREFIX, '');

		const { value } = marker;

		effect(() => {
			const shouldAttributeBePresent = Boolean((value as Function)());

			if (hydrated()) {
				toggleAttribute(currentNode, attributeName, shouldAttributeBePresent);
				callHook(Hooks.UPDATED, currentNode);
			}
		});

		currentNode.removeAttribute(name);
	}
};
