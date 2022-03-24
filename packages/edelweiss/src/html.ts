import { hash } from './hash';
import { sanitize } from './sanitizer';
import { isFunction, isIterable, isObject } from './checks';

const TO_REMOVE_ATTRIBUTE_NAME = 'data-unique';

const TO_REMOVE_ATTRIBUTE_REGEXP = new RegExp(
	`${TO_REMOVE_ATTRIBUTE_NAME}=(?:(?<quote>['"])[^'"]*\\k<quote>|\\S*)`,
	'g',
);

export type Marker = string;

export enum AttributeMark {
	HOOK = ':',
	EVENT = '@',
	TOGGLE = '?',
	REGULAR = '*',
	PROPERTY = '.',
}

export enum ValueType {
	NODE = 'node',
	HOOK = 'hook',
	EVENT = 'event',
	TOGGLE = 'toggle',
	REGULAR = 'regular',
	PROPERTY = 'property',
}

export interface Container {
	readonly value: unknown;
	readonly marker: Marker;
	readonly valueType: ValueType;
}

const createAttributeMarker = (precedingTemplate: string): Marker =>
	`{{${hash(precedingTemplate)}}}`;

const createNodeMarker = (precedingTemplate: string): Marker => {
	const id = hash(precedingTemplate);

	return `<!--{{start-${id}}}--><!--{{end-${id}}}-->`;
};

const createContainer = (
	value: unknown,
	marker: Marker,
	valueType: ValueType,
): Container => ({
	value,
	marker,
	valueType,
});

const templateId = Symbol();

export interface Template {
	readonly html: string;
	readonly markers: Map<Marker, Container>;

	readonly [key: symbol]: string;
}

const isPrimitive = (
	value: unknown,
): value is string | number | boolean | symbol | null | undefined =>
	!isObject(value) && !isFunction(value);

export const isTemplate = (value: unknown): value is Template =>
	isObject(value) && templateId in value;

const PRECEDING_ATTRIBUTE_REGEXP = /(\S+)\s*=\s*(?:['"][^'"]*|[^\s<>=]*)$/;

const prepareNode = (
	uniqueString: string,
	value: unknown,
	markers: Map<Marker, Container>,
): string => {
	if (isPrimitive(value)) {
		return sanitize(String(value));
	} else if (isTemplate(value)) {
		value.markers.forEach((value, key) => markers.set(key, value));

		return value.html;
	} else if (isIterable(value)) {
		return Array.from(value).reduce(
			(accumulator: string, current) =>
				accumulator + prepareNode(uniqueString + accumulator, current, markers),
			'',
		);
	} else {
		const marker = createNodeMarker(uniqueString);
		const container = createContainer(value, marker, ValueType.NODE);

		markers.set(marker, container);

		return marker;
	}
};

export const PROPERTY_VALUE_SEPARATOR = '_:_:_';

const preparePropertyAttribute = (
	precedingTemplate: string,
	attribute: string,
	value: unknown,
	markers: Map<Marker, Container>,
): string => {
	const marker = createAttributeMarker(precedingTemplate);
	const container = createContainer(value, marker, ValueType.PROPERTY);

	markers.set(marker, container);

	return `${attribute.slice(1)}${PROPERTY_VALUE_SEPARATOR}${marker}`;
};

export const html = (
	statics: TemplateStringsArray,
	...values: readonly unknown[]
): Template => {
	const markers: Map<Marker, Container> = new Map();

	return {
		[templateId]: 'Template',
		html: statics
			.reduce((accumulator, part, index) => {
				const precedingTemplate = accumulator + part;

				// Statics is always greater by one then values.
				// So we must not create marker for last static part.
				if (values.length <= index) {
					return precedingTemplate;
				}

				const attribute =
					PRECEDING_ATTRIBUTE_REGEXP.exec(precedingTemplate)?.[1] ?? null;

				const value = values[index];

				if (attribute === null) {
					return (
						precedingTemplate + prepareNode(precedingTemplate, value, markers)
					);
				} else {
					const attributeMark = attribute.charAt(0);

					switch (attributeMark) {
						case AttributeMark.HOOK:
						case AttributeMark.EVENT: {
							const marker = createAttributeMarker(precedingTemplate);
							const container = createContainer(
								value,
								marker,
								attributeMark === AttributeMark.HOOK
									? ValueType.HOOK
									: ValueType.EVENT,
							);

							markers.set(marker, container);

							return precedingTemplate + marker;
						}
						case AttributeMark.PROPERTY:
							return (
								precedingTemplate +
								preparePropertyAttribute(
									precedingTemplate,
									attribute,
									value,
									markers,
								)
							);
						case AttributeMark.TOGGLE: {
							if (isFunction(value)) {
								const marker = createAttributeMarker(precedingTemplate);
								const container = createContainer(
									value,
									marker,
									ValueType.TOGGLE,
								);

								markers.set(marker, container);

								return precedingTemplate + marker;
							} else {
								return precedingTemplate.replace(
									new RegExp(`\\${attribute}=(['"]?)$`),
									(match, quote) =>
										(Boolean(value)
											? match.slice(1)
											: match.replace(attribute, TO_REMOVE_ATTRIBUTE_NAME)) +
										// Add quotes if there aren't any
										(quote ? '' : '""'),
								);
							}
						}
						default: {
							if (isFunction(value)) {
								const marker = createAttributeMarker(precedingTemplate);
								const container = createContainer(
									value,
									marker,
									ValueType.REGULAR,
								);

								markers.set(marker, container);

								return precedingTemplate + marker;
							} else {
								return precedingTemplate + sanitize(String(value));
							}
						}
					}
				}
			}, '')
			.replace(TO_REMOVE_ATTRIBUTE_REGEXP, ''),
		markers,
	};
};
