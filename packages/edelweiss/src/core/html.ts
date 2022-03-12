import { sanitize } from './utilities/sanitizer';
import { insertBetweenClosedComment } from './utilities/comments';
import { createMarker, Marker, MarkerType } from './marker';
import { isObject, isFunction, isIterable } from './utilities/checks';
import {
	HTML_SYMBOL,
	HOOK_ATTRIBUTE_PREFIX,
	EVENT_ATTRIBUTE_PREFIX,
	TOGGLE_ATTRIBUTE_PREFIX,
	REGULAR_ATTRIBUTE_PREFIX,
	PROPERTY_ATTRIBUTE_PREFIX,
} from './constants';

/**
 * This RegExp has two capturing groups:
 *  1. attribute name.
 *  2. attribute value (may not be).
 */
const PRECEDING_ATTRIBUTE_REGEXP =
	/(\S+)=["']?((?:.(?!["']?\s+\S+=|\s*\/?[>"']))+.)?$/;

const regularAttributesWithMarkers =
	/\s(\w[\w-]*\w)=((?<optional_quote>['"]?){{\w+}}\k<optional_quote>|(?<quote>['"])[^'"]*{{\w+}}[^'"]*\k<quote>)/g;

const TO_REMOVE_ATTRIBUTE = 'data-to-remove';

const SPECIAL_SYMBOLS = {
	[HTML_SYMBOL.HOOK]: HOOK_ATTRIBUTE_PREFIX,
	[HTML_SYMBOL.EVENT]: EVENT_ATTRIBUTE_PREFIX,
	[HTML_SYMBOL.TOGGLE]: TOGGLE_ATTRIBUTE_PREFIX,
	[HTML_SYMBOL.PROPERTY]: PROPERTY_ATTRIBUTE_PREFIX,
};

const templateId: unique symbol = Symbol();

export const markers = new Map<string, Marker>();

export interface Template {
	readonly html: string;
	readonly [templateId]: boolean;
}

export const isTemplate = (value: unknown): value is Template =>
	isObject(value) && templateId in value;

const buildStaticText = (value: unknown): string => sanitize(String(value));

const buildStaticTemplate = (value: Template): string => value.html;

const buildStaticFragments = (value: unknown): string =>
	isTemplate(value)
		? buildStaticTemplate(value)
		: !isFunction(value) && !isObject(value)
		? buildStaticText(value)
		: '';

const buildStaticHTML = (previousTemplate: string, value: unknown): string => {
	if (isFunction(value)) {
		const marker = createMarker(previousTemplate, value);

		markers.set(marker.toString(), marker);

		const staticHTML = buildStaticFragments(value());

		return (
			previousTemplate +
			insertBetweenClosedComment(marker.toString(), staticHTML)
		);
	}

	let staticHTML = buildStaticFragments(value);

	if (staticHTML === '') {
		const marker = createMarker(previousTemplate, value);

		markers.set(marker.toString(), marker);

		staticHTML = marker.toString();
	}

	return previousTemplate + staticHTML;
};

const buildStaticRegularAttribute = (
	previousTemplate: string,
	value: unknown,
): string => {
	if (isFunction(value)) {
		const marker = createMarker(previousTemplate, value, HTML_SYMBOL.REST);

		markers.set(marker.toString(), marker);

		return previousTemplate + marker.toString();
	}

	return previousTemplate + sanitize(String(value));
};

const buildStaticToggleAttribute = (
	previousTemplate: string,
	attribute: string,
	value: unknown,
): string => {
	if (isFunction(value)) {
		const marker = createMarker(previousTemplate, value, HTML_SYMBOL.TOGGLE);

		markers.set(marker.toString(), marker);

		return (
			previousTemplate.replace(
				attribute,
				`${TOGGLE_ATTRIBUTE_PREFIX}${attribute.slice(
					1,
				)}="${marker.toString()}" ${
					Boolean(value) ? attribute.slice(1) : TO_REMOVE_ATTRIBUTE
				}`,
			) +
			// We should add quotes if there aren't any to prevent
			// catching other attributes as values.
			(/['"]$/.test(previousTemplate) ? '' : '""')
		);
	}

	return previousTemplate.replace(
		attribute,
		Boolean(value) ? attribute.slice(1) : TO_REMOVE_ATTRIBUTE,
	);
};

export const html = (
	statics: TemplateStringsArray,
	...values: ReadonlyArray<unknown>
): Template => ({
	[templateId]: true,
	html: statics
		.reduce((all, current, index) => {
			const previousTemplate = all + current;

			// Statics is always greater by one then values.
			// So we must not create marker for last static part.
			if (values.length <= index) {
				return previousTemplate;
			}

			const attributeName =
				PRECEDING_ATTRIBUTE_REGEXP.exec(previousTemplate)?.[1];

			const value = values[index];

			if (attributeName === undefined) {
				return isIterable(value)
					? Array.from(value).reduce(
							(accumulator: string, item) => buildStaticHTML(accumulator, item),
							previousTemplate,
					  )
					: buildStaticHTML(previousTemplate, value);
			} else {
				switch (attributeName.charAt(0)) {
					case HTML_SYMBOL.HOOK:
					case HTML_SYMBOL.EVENT:
					case HTML_SYMBOL.PROPERTY: {
						const marker = createMarker(
							previousTemplate,
							value,
							attributeName.charAt(0) as HTML_SYMBOL,
						);

						markers.set(marker.toString(), marker);

						return (
							previousTemplate.replace(
								attributeName,
								SPECIAL_SYMBOLS[
									attributeName.charAt(0) as keyof typeof SPECIAL_SYMBOLS
								] + attributeName.slice(1),
							) + marker.toString()
						);
					}
					case HTML_SYMBOL.TOGGLE:
						return buildStaticToggleAttribute(
							previousTemplate,
							attributeName,
							value,
						);
					default:
						return buildStaticRegularAttribute(previousTemplate, value);
				}
			}
		}, '')
		.replace(
			new RegExp(`${TO_REMOVE_ATTRIBUTE}=(?<quote>['"]?)\\k<quote>`, 'g'),
			'',
		)
		.replace(
			regularAttributesWithMarkers,
			(_, attribute: string, values: string) => {
				const attributeMarkers = Array.from(markers.values()).filter(
					(marker) =>
						marker.type === MarkerType.REGULAR_ATTRIBUTE &&
						values.includes(marker.toString()),
				);

				const filledValues = attributeMarkers.reduce(
					(part, { value, toString }) =>
						part.replace(
							toString(),
							sanitize(String(isFunction(value) ? value() : value)),
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
		),
});
