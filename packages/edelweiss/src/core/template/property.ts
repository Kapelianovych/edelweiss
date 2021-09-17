import { effect } from '../reactive/effect';
import { isFunction } from '../utilities/checks';
import { RawDOMFragment } from '../fragment';
import { callHook, Hooks } from '../hooks';
import { PROPERTY_ATTRIBUTE_PREFIX } from '../constants';

const updateProperty = (target: Element, property: string, value: unknown) =>
	((target as Element & { [property: string]: unknown })[property] = value);

export const processProperty = (
	currentNode: Element,
	name: string,
	value: string,
	markers: RawDOMFragment['markers'],
): void => {
	const propertyMarker = markers.get(value);

	if (propertyMarker !== undefined) {
		const propertyName = name.replace(PROPERTY_ATTRIBUTE_PREFIX, '');

		const { value } = propertyMarker;

		isFunction(value)
			? effect(() => {
					updateProperty(currentNode, propertyName, value());
					callHook(Hooks.UPDATED, currentNode);
			  })
			: updateProperty(currentNode, propertyName, value);

		currentNode.removeAttribute(name);
	}
};
