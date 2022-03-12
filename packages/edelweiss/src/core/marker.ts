import { hash } from './utilities/hash';
import { HTML_SYMBOL } from './constants';
import { closedCommentWith } from './utilities/comments';

/** Base class for markers. */
export interface Marker {
	readonly type: MarkerType;
	readonly value: unknown;
	readonly toString: () => string;
}

export enum MarkerType {
	NODE = 'node',
	HOOK_ATTRIBUTE = 'hook',
	EVENT_ATTRIBUTE = 'event',
	TOGGLE_ATTRIBUTE = 'toggle',
	REGULAR_ATTRIBUTE = 'regular',
	PROPERTY_ATTRIBUTE = 'property',
}

const markersMap: Record<string, MarkerType> = {
	[HTML_SYMBOL.HOOK]: MarkerType.HOOK_ATTRIBUTE,
	[HTML_SYMBOL.EVENT]: MarkerType.EVENT_ATTRIBUTE,
	[HTML_SYMBOL.TOGGLE]: MarkerType.TOGGLE_ATTRIBUTE,
	[HTML_SYMBOL.PROPERTY]: MarkerType.PROPERTY_ATTRIBUTE,
};

const getMarkerAttributeType = (attributeSymbol: string): MarkerType =>
	markersMap[attributeSymbol] ?? MarkerType.REGULAR_ATTRIBUTE;

export const createMarker = (
	previousHTML: string,
	value: unknown,
	attributeSymbol?: HTML_SYMBOL,
): Marker => {
	const id = hash(previousHTML);

	return {
		value,
		type:
			attributeSymbol !== undefined
				? getMarkerAttributeType(attributeSymbol)
				: MarkerType.NODE,
		toString: () =>
			attributeSymbol === undefined
				? closedCommentWith(`{{start-${id}}}`)
				: `{{${id}}}`,
	};
};
