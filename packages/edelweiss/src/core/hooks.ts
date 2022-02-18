import { isElement } from './utilities/node_type';

/**
 * Creates attribute name for hook.
 * Nodes that have hooks need to be marked.
 */
const attributeOf = (name: Hooks): string => `data-es-${name}`;

/**
 * Function that invokes on some action made with element.
 * Accepts the element as argument.
 */
export interface Hook {
	<E extends Element>(element: E): void;
}

export enum Hooks {
	MOUNTED = 'mounted',
	UPDATED = 'updated',
	WILL_UNMOUNT = 'will-unmount',
}

const hookMaps = {
	[Hooks.MOUNTED]: new WeakMap<Element, Hook>(),
	[Hooks.UPDATED]: new WeakMap<Element, Hook>(),
	[Hooks.WILL_UNMOUNT]: new WeakMap<Element, Hook>(),
} as const;

export const callHook = (name: Hooks, node: Element): void =>
	void hookMaps[name].get(node)?.(node);

export const registerHook = (name: Hooks, node: Element, hook: Hook): void => {
	hookMaps[name].set(node, hook);
	node.setAttribute(attributeOf(name), '');
};

export const callHookOnElementWithChildren = (
	name: Hooks,
	element: Node,
): void => {
	if (isElement(element)) {
		callHook(name, element);
		element
			.querySelectorAll('[' + attributeOf(name) + ']')
			.forEach((node) => callHook(name, node));
	}
};
