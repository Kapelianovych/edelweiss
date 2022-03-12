import { effect } from '../reactive/effect';
import { markers } from '../html';
import { sanitize } from '../utilities/sanitizer';
import { hydrated } from '../environment';
import { callHook, Hooks } from '../hooks';
import { REGULAR_ATTRIBUTE_PREFIX } from '../constants';

export const processRegularAttribute = (
	currentNode: Element,
	name: string,
	value: string,
): void => {
	const attributeMarkers = Array.from(markers.values()).filter((marker) =>
		value.includes(marker.toString()),
	);

	effect(() => {
		const attributeValue = attributeMarkers
			.reduce(
				(attributeValue, { toString, value }) =>
					attributeValue.replace(
						toString(),
						sanitize(String((value as Function)())),
					),
				value,
			)
			.trim();

		if (hydrated()) {
			currentNode.setAttribute(
				name.replace(REGULAR_ATTRIBUTE_PREFIX, ''),
				attributeValue,
			);
			callHook(Hooks.UPDATED, currentNode);
		}
	});

	if (name.startsWith(REGULAR_ATTRIBUTE_PREFIX)) {
		currentNode.removeAttribute(name);
	}
};
