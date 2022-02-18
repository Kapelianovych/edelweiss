import { createMarker, Marker } from './marker';
import {
	HOOK_SYMBOL,
	EVENT_SYMBOL,
	TOGGLE_SYMBOL,
	PROPERTY_SYMBOL,
	HOOK_ATTRIBUTE_PREFIX,
	EVENT_ATTRIBUTE_PREFIX,
	TOGGLE_ATTRIBUTE_PREFIX,
	PROPERTY_ATTRIBUTE_PREFIX,
} from './constants';

/**
 * This RegExp has two capturing groups:
 *  1. attribute name.
 *  2. attribute value (may not be).
 */
const PRECEDING_ATTRIBUTE_REGEXP =
	/(\S+)=["']?((?:.(?!["']?\s+\S+=|\s*\/?[>"']))+.)?$/;

const SPECIAL_SYMBOLS = {
	[HOOK_SYMBOL]: HOOK_ATTRIBUTE_PREFIX,
	[EVENT_SYMBOL]: EVENT_ATTRIBUTE_PREFIX,
	[TOGGLE_SYMBOL]: TOGGLE_ATTRIBUTE_PREFIX,
	[PROPERTY_SYMBOL]: PROPERTY_ATTRIBUTE_PREFIX,
};

export interface Content {
	readonly html: string;
	readonly markers: Map<string, Marker>;
}

export const createContent = (
	statics: TemplateStringsArray,
	values: ReadonlyArray<unknown>,
): Content => {
	const markers = new Map<string, Marker>();

	const html = statics.reduce((all, current, index) => {
		const previousTemplate = all + current;

		// Statics is always greater by one then values.
		// So we must not create marker for last static part.
		if (values.length <= index) {
			return previousTemplate;
		} else {
			const attributeName =
				PRECEDING_ATTRIBUTE_REGEXP.exec(previousTemplate)?.[1];

			const marker = createMarker(
				previousTemplate,
				values[index],
				attributeName?.charAt(0),
			);
			const previousTemplatePart: string =
				attributeName !== undefined &&
				Object.keys(SPECIAL_SYMBOLS).includes(attributeName.charAt(0))
					? previousTemplate.replace(
							attributeName,
							SPECIAL_SYMBOLS[
								attributeName.charAt(0) as keyof typeof SPECIAL_SYMBOLS
							] + attributeName.slice(1),
					  )
					: previousTemplate;

			markers.set(marker.toString(), marker);

			return previousTemplatePart + marker.toString();
		}
	}, '');

	return {
		html,
		markers,
	};
};
