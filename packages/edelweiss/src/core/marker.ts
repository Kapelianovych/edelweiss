import { hash } from './utilities/hash';
import { closedCommentWith } from './utilities/comments';
import {
	HOOK_SYMBOL,
	EVENT_SYMBOL,
	TOGGLE_SYMBOL,
	PROPERTY_SYMBOL,
} from './constants';

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

const getMarkerTypeFrom = (attributeSymbol: string): MarkerType =>
	({
		[HOOK_SYMBOL]: MarkerType.HOOK_ATTRIBUTE,
		[EVENT_SYMBOL]: MarkerType.EVENT_ATTRIBUTE,
		[TOGGLE_SYMBOL]: MarkerType.TOGGLE_ATTRIBUTE,
		[PROPERTY_SYMBOL]: MarkerType.PROPERTY_ATTRIBUTE,
	}[attributeSymbol] ?? MarkerType.REGULAR_ATTRIBUTE);

export const createMarker = (
	previousHTML: string,
	value: unknown,
	attributeSymbol?: string,
): Marker => {
	const id = hash(previousHTML);

	return {
		value,
		type:
			attributeSymbol !== undefined
				? getMarkerTypeFrom(attributeSymbol)
				: MarkerType.NODE,
		toString: () =>
			attributeSymbol === undefined
				? closedCommentWith(`{{start-${id}}}`)
				: `{{${id}}}`,
	};
};
