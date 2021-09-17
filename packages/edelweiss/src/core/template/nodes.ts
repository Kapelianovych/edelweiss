import { effect } from '../reactive/effect';
import { isFunction } from '../utilities/checks';
import { RawDOMFragment } from '../fragment';
import { collect, Fragment } from './collect';
import { isEndNodeFor, nodeMarkerId } from '../marker';
import { callHookOnElementWithChildren, Hooks } from '../hooks';

const unmountOldNodes = (currentNode: Comment) => {
	while (
		currentNode.nextSibling !== null &&
		!isEndNodeFor(currentNode, currentNode.nextSibling)
	) {
		callHookOnElementWithChildren(
			Hooks['WILL_UNMOUNT'],
			currentNode.nextSibling,
		);
		currentNode.nextSibling.remove();
	}
};

const callMountedHook = (currentNode: Comment) => {
	let node: Node = currentNode;
	while (
		node.nextSibling !== null &&
		!isEndNodeFor(currentNode, node.nextSibling)
	) {
		callHookOnElementWithChildren(Hooks.MOUNTED, node.nextSibling);
		node = node.nextSibling;
	}
};

export const processNodes = (
	currentNode: Comment,
	markers: RawDOMFragment['markers'],
): void => {
	const nodeMarker = markers.get(nodeMarkerId(currentNode.textContent ?? ''));

	if (nodeMarker !== undefined) {
		const { value } = nodeMarker;

		isFunction<Fragment>(value)
			? effect(() => {
					unmountOldNodes(currentNode);
					currentNode.after(collect(value()));
					callMountedHook(currentNode);
			  })
			: currentNode.after(collect(value));
	}
};
