import { isComment } from '../utilities/node_type';
import { processHook } from './hook';
import { processNodes } from './nodes';
import { processProperty } from './property';
import { processEventListener } from './event_attribute';
import { processToggleAttribute } from './toggle_attribute';
import { processRegularAttribute } from './regular_attribute';
import {
	HOOK_ATTRIBUTE_PREFIX,
	EVENT_ATTRIBUTE_PREFIX,
	TOGGLE_ATTRIBUTE_PREFIX,
	PROPERTY_ATTRIBUTE_PREFIX,
} from '../constants';

const NO_PREFIX = '__no_prefix';

const PREFIXES_MAP = {
	[NO_PREFIX]: processRegularAttribute,
	[HOOK_ATTRIBUTE_PREFIX]: processHook,
	[EVENT_ATTRIBUTE_PREFIX]: processEventListener,
	[TOGGLE_ATTRIBUTE_PREFIX]: processToggleAttribute,
	[PROPERTY_ATTRIBUTE_PREFIX]: processProperty,
};

const findAttributeHandler = (name: string) =>
	PREFIXES_MAP[
		(Object.keys(PREFIXES_MAP).find((prefix) => name.startsWith(prefix)) ??
			NO_PREFIX) as keyof typeof PREFIXES_MAP
	];

/**
 * Processing document fragment is accomplished in three steps:
 *
 *  1. Finding marker with value.
 *  2. Replacing marker's value with marker in node.
 *     Here bridges are established.
 *  3. Removing marker and relative unneeded stuff (special attributes).
 */
export const fillNodes = <T extends Node>(nodes: T): T => {
	const walker = document.createTreeWalker(
		nodes,
		NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_COMMENT,
	);

	while (walker.nextNode() !== null) {
		isComment(walker.currentNode)
			? processNodes(walker.currentNode, fillNodes)
			: Array.from((walker.currentNode as Element).attributes).forEach(
					({ name, value }) =>
						findAttributeHandler(name)(
							walker.currentNode as Element,
							name,
							value,
						),
			  );
	}

	return nodes;
};
