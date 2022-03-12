import { effect } from '../reactive/effect';
import { markers } from '../html';
import { hydrated } from '../environment';
import { isFunction } from '../utilities/checks';
import { collect, Fragment } from './collect';
import { callHookOnElementWithChildren, Hooks } from '../hooks';
import {
	closedCommentWith,
	isNodeClosedCommentFor,
} from '../utilities/comments';

const unmountOldNodes = (fromComment: Comment) => {
	while (
		fromComment.nextSibling !== null &&
		!isNodeClosedCommentFor(fromComment, fromComment.nextSibling)
	) {
		callHookOnElementWithChildren(
			Hooks['WILL_UNMOUNT'],
			fromComment.nextSibling,
		);
		fromComment.nextSibling.remove();
	}
};

const callMountedHook = (currentNode: Comment) => {
	let node: Node = currentNode;
	while (
		node.nextSibling !== null &&
		!isNodeClosedCommentFor(currentNode, node.nextSibling)
	) {
		callHookOnElementWithChildren(Hooks.MOUNTED, node.nextSibling);
		node = node.nextSibling;
	}
};

const isClosedCommentEmpty = (comment: Comment): boolean =>
	comment.nextSibling !== null &&
	isNodeClosedCommentFor(comment, comment.nextSibling);

const commentsToRemove = new Set<Comment>();

export const removeStaticComments = () => {
	commentsToRemove.forEach((comment) => comment.remove());
	commentsToRemove.clear();
};

const replaceCommentsWithStaticNode = (
	comment: Comment,
	withNode: Node | string,
): void => {
	commentsToRemove.add(comment);
	commentsToRemove.add(comment.nextSibling as Comment);
	comment.after(withNode);
};

export const processNodes = (
	currentNode: Comment,
	fillNodes: <T extends Node>(node: T) => T,
): void => {
	const nodeMarker = markers.get(
		closedCommentWith(currentNode.textContent ?? ''),
	);

	if (nodeMarker !== undefined) {
		const { value } = nodeMarker;

		if (isFunction<Fragment>(value)) {
			effect(() => {
				const nodes = value();

				if (hydrated()) {
					unmountOldNodes(currentNode);
					currentNode.after(fillNodes(collect(nodes) as DocumentFragment));
					callMountedHook(currentNode);
				}
			});
		} else {
			isClosedCommentEmpty(currentNode)
				? replaceCommentsWithStaticNode(currentNode, collect(value))
				: null;
		}
	}
};
