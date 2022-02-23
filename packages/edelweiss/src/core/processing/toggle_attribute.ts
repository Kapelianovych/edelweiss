import { effect } from '../reactive/effect';
import { Marker } from '../marker';
import { hydrated } from '../environment';
import { Computed } from '../reactive/global';
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

		effect(() => {
			const shouldAttributeBePresent = Boolean(
				(markerValue as Computed<unknown>)(),
			);

			if (hydrated()) {
				toggleAttribute(currentNode, attributeName, shouldAttributeBePresent);
				callHook(Hooks.UPDATED, currentNode);
			}
		});

		currentNode.removeAttribute(name);
	}
};

export const processToggleAttributeString = (
	html: string,
	marker: Marker,
): string =>
	html.replace(
		new RegExp(
			`\\s(\\w[\\w-]*\\w)=(?<quote>["']?)${marker.toString()}\\k<quote>`,
		),
		(_, attribute) =>
			` ${attribute}="${marker.toString()}" ${
				Boolean((marker.value as Computed<unknown>)())
					? attribute.replace(TOGGLE_ATTRIBUTE_PREFIX, '')
					: ''
			}`,
	);
