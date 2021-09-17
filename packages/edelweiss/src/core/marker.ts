import { uid } from './utilities/uid';
import { createComment } from './utilities/create_comment';

/** Base class for markers. */
export interface Marker {
	readonly value: unknown;
	readonly toString: () => string;
}

export const nodeMarkerId = (content: string): string =>
	createComment(content) + createComment(content.replace('start', 'end'));

export const createMarker = (
	value: unknown,
	type: 'attribute' | 'node',
): Marker => {
	const id = uid();

	return {
		value,
		toString: () =>
			type === 'node' ? nodeMarkerId(`{{start-${id}}}`) : `{{${id}}}`,
	};
};

export const isEndNodeFor = (node: Comment, current: Node): boolean =>
	node.textContent?.replace('start', 'end') === current.textContent;
