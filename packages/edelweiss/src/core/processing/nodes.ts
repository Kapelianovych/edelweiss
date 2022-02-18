import { effect } from '../reactive/effect';
import { Marker } from '../marker';
import { isFunction } from '../utilities/checks';
import { collect, Fragment } from './collect';
import { callHookOnElementWithChildren, Hooks } from '../hooks';
import {
	closedCommentWith,
	isNodeClosedCommentFor,
	insertBetweenClosedComment,
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

export const commentsToRemove = new Set<Comment>();

const replaceCommentWithStaticNode = (
	comment: Comment,
	withNode: Node | string,
): void => {
	// We can safely remove next node and
	// walker won't stumble.
	comment.nextSibling?.remove();
	comment.after(withNode);
	commentsToRemove.add(comment);
};

export const processNodes = (
	currentNode: Comment,
	markers: Map<string, Marker>,
): void => {
	const nodeMarker = markers.get(
		closedCommentWith(currentNode.textContent ?? ''),
	);

	if (nodeMarker !== undefined) {
		const { value } = nodeMarker;

		isFunction<Fragment>(value)
			? effect(() => {
					unmountOldNodes(currentNode);
					currentNode.after(collect(value()));
					callMountedHook(currentNode);
			  })
			: isClosedCommentEmpty(currentNode)
			? replaceCommentWithStaticNode(currentNode, collect(value))
			: null;
	}
};

export const processNodesString = (html: string, marker: Marker): string => {
	const nodesToInsert = isFunction<unknown>(marker.value)
		? insertBetweenClosedComment(
				marker.toString(),
				collect(marker.value()) as string,
		  )
		: (collect(marker.value) as string);

	return html.replace(marker.toString(), nodesToInsert);
};
