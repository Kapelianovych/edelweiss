import { effect } from '../reactive/effect';
import { Marker } from '../marker';
import { hydrated } from '../environment';
import { isFunction } from '../utilities/checks';
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
	markers: Map<string, Marker>,
): void => {
	const toggleMarker = markers.get(value);

	if (toggleMarker !== undefined) {
		const attributeName = name.replace(TOGGLE_ATTRIBUTE_PREFIX, '');

		const { value: markerValue } = toggleMarker;

		isFunction<boolean>(markerValue)
			? effect(() => {
					const shouldAttributeBePresent = Boolean(markerValue());

					if (hydrated()) {
						toggleAttribute(
							currentNode,
							attributeName,
							shouldAttributeBePresent,
						);
						callHook(Hooks.UPDATED, currentNode);
					}
			  })
			: !currentNode.hasAttribute(attributeName)
			? toggleAttribute(currentNode, attributeName, Boolean(markerValue))
			: null;

		currentNode.removeAttribute(name);
	}
};

export const processToggleAttributeString = (
	html: string,
	marker: Marker,
): string => {
	const key = marker.toString();
	const isAttributeDynamic = isFunction(marker.value);
	const shouldAttributeBeIncluded = isAttributeDynamic
		? (marker.value as Function)()
		: marker.value;

	return html.replace(
		new RegExp(`([\\w-]+)=["']?${key}['"]?`),
		(_, attribute) =>
			`${isAttributeDynamic ? `${attribute}="${key}"` : ''} ${
				shouldAttributeBeIncluded
					? attribute.replace(TOGGLE_ATTRIBUTE_PREFIX, '')
					: ''
			}`,
	);
};
