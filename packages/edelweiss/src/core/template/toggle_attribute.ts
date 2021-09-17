import { effect } from '../reactive/effect';
import { isFunction } from '../utilities/checks';
import { RawDOMFragment } from '../fragment';
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
	markers: RawDOMFragment['markers'],
): void => {
	const toggleMarker = markers.get(value);

	if (toggleMarker !== undefined) {
		const attributeName = name.replace(TOGGLE_ATTRIBUTE_PREFIX, '');

		const { value: markerValue } = toggleMarker;

		isFunction<boolean>(markerValue)
			? effect(() => {
					toggleAttribute(currentNode, attributeName, Boolean(markerValue()));
					callHook(Hooks.UPDATED, currentNode);
			  })
			: toggleAttribute(currentNode, attributeName, Boolean(markerValue));

		currentNode.removeAttribute(name);
	}
};
