import { hydrated } from './core/environment';
import { fillNodes } from './core/processing';
import { removeStaticComments } from './core/processing/nodes';
import { collect, Fragment } from './core/processing/collect';
import { callHookOnElementWithChildren, Hooks } from './core/hooks';

interface RenderFunction {
	(fragment: Fragment): string;
	(fragment: Fragment, container: ParentNode): void;
}

/**
 * Attaches processing to container in DOM.
 * It does not create reactive bindings, neither worry
 * about container existence. Also if container already
 * has child nodes, then they will not removed and processing
 * nodes will be inserted right before them.
 *
 * Without container provided, produces HTML as string.
 */
export const render = ((
	fragment: Fragment,
	container?: ParentNode,
): void | string => {
	const nodes = collect(fragment);

	// fillNodes requires this flag be `true` before processing nodes.
	hydrated(true);

	if (container === undefined) {
		return String(nodes);
	}

	const filledNodes = fillNodes(nodes as Node);

	removeStaticComments();

	container.prepend(filledNodes);
	callHookOnElementWithChildren(Hooks.MOUNTED, container);
}) as RenderFunction;

/**
 * Attaches event listeners and reactive containers to
 * browser's DOM.
 *
 * A `startFrom` node can be any node, it doesn't need to
 * be a node that is described by a `fragment`.
 *
 * Should be invoked only in browser environment.
 */
export const hydrate = (startFrom: Node): void => {
	fillNodes(startFrom);

	removeStaticComments();

	hydrated(true);
};
