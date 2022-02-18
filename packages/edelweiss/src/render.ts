import { Template } from './core/template';
import { renderer } from './core/renderer';
import { fillNodes } from './core/processing';
import { createComment } from './core/utilities/comments';
import { collect, Fragment } from './core/processing/collect';
import { isIterable, isObject } from './core/utilities/checks';
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

	if (container === undefined) {
		return nodes instanceof renderer.getDocumentFragment()
			? convertDocumentFragmentToString(nodes)
			: String(nodes);
	}

	container.prepend(nodes);
	callHookOnElementWithChildren(Hooks.MOUNTED, container as unknown as Node);
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
export const hydrate = (fragment: Fragment, startFrom: Node): void => {
	if (isObject<Template>(fragment) && fragment.isTemplate) {
		fillNodes(startFrom, fragment.markers);
	} else if (isIterable(fragment)) {
		Array.from(fragment).forEach((fragmentPart) =>
			hydrate(fragmentPart, startFrom),
		);
	}
};
