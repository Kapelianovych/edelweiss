import { renderer } from './core/renderer';
import { hydrated } from './core/environment';
import { isFunction } from './core/utilities/checks';
import { createComment } from './core/utilities/comments';
import { collect, Fragment } from './core/processing/collect';
import { MarkerType, Marker } from './core/marker';
import { isIterable, isObject } from './core/utilities/checks';
import { fillNodes, fillString } from './core/processing';
import { callHookOnElementWithChildren, Hooks } from './core/hooks';

interface RenderFunction {
	(fragment: Fragment): string;
	(fragment: Fragment, container: ParentNode): void;
}

const convertDocumentFragmentToString = (fragment: DocumentFragment): string =>
	Array.from(fragment.childNodes).reduce(
		(part, node) =>
			part +
			(node instanceof renderer.getComment()
				? createComment(node.textContent ?? '')
				: (node as Element).outerHTML ?? node.textContent ?? ''),
		'',
	);

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
		return nodes instanceof renderer.getDocumentFragment()
			? convertDocumentFragmentToString(fillNodes(nodes))
			: fillString(nodes);
	}

	if (nodes instanceof renderer.getDocumentFragment()) {
		container.prepend(fillNodes(nodes));
		callHookOnElementWithChildren(Hooks.MOUNTED, container as unknown as Node);
	}
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

	hydrated(true);
};
