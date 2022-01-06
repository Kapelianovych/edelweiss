import { createComment } from './core/utilities/create_comment';
import { collect, Fragment } from './core/template/collect';
import { callHookOnElementWithChildren, Hooks } from './core/hooks';

/**
 * Attaches template to container in DOM.
 * It does not create reactive bindings, neither worry
 * about container existence. Also if container already
 * has child nodes, then they will not removed and template
 * nodes will be inserted right before them.
 */
export const render = (container: ParentNode, part: Fragment): void => {
	container.prepend(collect(part));
	callHookOnElementWithChildren(Hooks.MOUNTED, container as unknown as Node);
};

/** Transforms DOM to string. */
export const renderToString = (part: Fragment): string =>
	Array.from(collect(part).childNodes).reduce(
		(raw, node) =>
			// We expect only Comment, Element and Text nodes.
			node instanceof Comment
				? raw + createComment(node.textContent ?? '')
				: raw + ((node as Element).outerHTML ?? node.textContent ?? ''),
		'',
	);
