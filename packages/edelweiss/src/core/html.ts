import { sanitize } from './utilities/sanitizer';
import { isObject, isFunction } from './utilities/checks';
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

const templateId: unique symbol = Symbol();

export const markers = new Map<string, Marker>();

export interface Template {
	readonly html: string;
	readonly [templateId]: boolean;
}

export const isTemplate = (value: unknown): value is Template =>
	isObject(value) && templateId in value;

export const html = (
	statics: TemplateStringsArray,
	...values: ReadonlyArray<unknown>
): Template => {
	let shouldHeadQuoteBeRemoved = false;

	return {
		[templateId]: true,
		html: statics.reduce((all, current, index) => {
			const previousTemplate =
				all + (shouldHeadQuoteBeRemoved ? current.slice(1) : current);

			shouldHeadQuoteBeRemoved = false;

			// Statics is always greater by one then values.
			// So we must not create marker for last static part.
			if (values.length <= index) {
				return previousTemplate;
			}

			const attributeName =
				PRECEDING_ATTRIBUTE_REGEXP.exec(previousTemplate)?.[1];

			const value = values[index];

			if (isTemplate(value)) {
				return previousTemplate + value.html;
			}

			if (attributeName !== undefined && !isFunction(value)) {
				switch (attributeName.charAt(0)) {
					case TOGGLE_SYMBOL: {
						shouldHeadQuoteBeRemoved = /['"]$/.test(previousTemplate);
						return previousTemplate.replace(
							new RegExp(`${'\\' + attributeName}=['"]?`),
							Boolean(value) ? attributeName.slice(1) : '',
						);
					}
					case HOOK_SYMBOL:
					case EVENT_SYMBOL:
					case PROPERTY_SYMBOL:
						break;
					default:
						return previousTemplate + sanitize(String(value));
				}
			}

			// Besides functions value can be instance of Element class or
			// DocumentFragment. So, we should handle those static values
			// later.
			const marker = createMarker(
				previousTemplate,
				value,
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
		}, ''),
	};
};
