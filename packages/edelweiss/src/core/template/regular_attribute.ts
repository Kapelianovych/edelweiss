import { Data } from '../reactive/data';
import { effect } from '../reactive/effect';
import { isFunction } from '../utilities/checks';
import { RawDOMFragment } from '../fragment';
import { callHook, Hooks } from '../hooks';

export const processRegularAttribute = (
	currentNode: Element,
	name: string,
	value: string,
	markers: RawDOMFragment['markers'],
): void => {
	const attributeMarkers = Array.from(markers.values()).filter((marker) =>
		value.includes(marker.toString()),
	);

	const staticPart = attributeMarkers.reduce(
		(part, marker) =>
			isFunction<string>(marker.value)
				? part
				: part.replace(marker.toString(), String(marker.value)),
		value,
	);

	const dynamicMarkers = attributeMarkers.filter((marker) =>
		isFunction<string>(marker.value),
	);

	effect(() => {
		currentNode.setAttribute(
			name,
			dynamicMarkers
				.reduce(
					(attributeValue, marker) =>
						attributeValue.replace(
							marker.toString(),
							String((marker.value as Data<unknown>)()),
						),
					staticPart,
				)
				.trim(),
		);
		callHook(Hooks.UPDATED, currentNode);
	});
};
