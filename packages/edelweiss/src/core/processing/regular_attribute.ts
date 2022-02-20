import { Data } from '../reactive/data';
import { effect } from '../reactive/effect';
import { hydrated } from '../environment';
import { Marker } from '../marker';
import { isFunction } from '../utilities/checks';
import { callHook, Hooks } from '../hooks';

export const processRegularAttribute = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<string, Marker>,
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
		const attributeValue = dynamicMarkers
			.reduce(
				(attributeValue, marker) =>
					attributeValue.replace(
						marker.toString(),
						String((marker.value as Data<unknown>)()),
					),
				staticPart,
			)
			.trim();

		if (hydrated()) {
			currentNode.setAttribute(name.replace(/^regular-/, ''), attributeValue);
			callHook(Hooks.UPDATED, currentNode);
		}
	});

	if (name.startsWith('regular-')) {
		currentNode.removeAttribute(name);
	}
};

const regularAttributesWithMarkers =
	/\s((?:data-)?\w+)=['"]?(\s*(?:[\w-]+\s+)*(?:(?:{{\w+}}\s*)+(?:[\w-]+\s*)*)+)['"]?/g;

export const processRegularAttributeString = (
	html: string,
	markers: readonly Marker[],
): string =>
	html.replace(
		regularAttributesWithMarkers,
		(_, attribute: string, values: string) => {
			const attributeMarkers = markers.filter((marker) =>
				values.includes(marker.toString()),
			);

			const filledValues = attributeMarkers.reduce(
				(part, marker) =>
					part.replace(
						marker.toString(),
						String(
							isFunction<string>(marker.value) ? marker.value() : marker.value,
						),
					),
				values,
			);

			const dynamicMarkers = attributeMarkers.filter((marker) =>
				isFunction<string>(marker.value),
			);

			const filledValuesWithoutDynamicPart = dynamicMarkers.reduce(
				(part, marker) =>
					part.replace((marker.value as Function)(), marker.toString()),
				filledValues,
			);

			return ` ${
				dynamicMarkers.length > 0
					? // We should add extra whitespace because of RegExp above.
					  ` regular-${attribute}="${filledValuesWithoutDynamicPart}"`
					: ''
			} ${attribute}="${filledValues}"`;
		},
	);
