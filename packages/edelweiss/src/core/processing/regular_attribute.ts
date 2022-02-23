import { Data } from '../reactive/data';
import { effect } from '../reactive/effect';
import { Marker } from '../marker';
import { sanitize } from '../utilities/sanitizer';
import { hydrated } from '../environment';
import { isFunction } from '../utilities/checks';
import { callHook, Hooks } from '../hooks';
import { REGULAR_ATTRIBUTE_PREFIX } from '../constants';

export const processRegularAttribute = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<string, Marker>,
): void => {
	const attributeMarkers = Array.from(markers.values()).filter((marker) =>
		value.includes(marker.toString()),
	);

	effect(() => {
		const attributeValue = attributeMarkers
			.reduce(
				(attributeValue, marker) =>
					attributeValue.replace(
						marker.toString(),
						sanitize(String((marker.value as Data<unknown>)())),
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

const regularAttributesWithMarkers =
	/\s(\w[\w-]*\w)=((?<optional_quote>['"]?){{\w+}}\k<optional_quote>|(?<quote>['"])[^'"]*{{\w+}}[^'"]*\k<quote>)/g;

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
						sanitize(
							String(
								isFunction<string>(marker.value)
									? marker.value()
									: marker.value,
							),
						),
					),
				values.replace(/['"]/g, ''),
			);

			return ` ${
				attributeMarkers.length > 0
					? // We should add extra whitespace because of the RegExp above.
					  ` ${REGULAR_ATTRIBUTE_PREFIX + attribute}="${values.replace(
							/['"]/g,
							'',
					  )}"`
					: ''
			} ${attribute}="${filledValues}"`;
		},
	);
