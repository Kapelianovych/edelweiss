export const createComment = (content: string): string => `<!--${content}-->`;

export const closedCommentWith = (key: string): string =>
	createComment(key) + createComment(key.replace('start', 'end'));

export const insertBetweenClosedComment = (
	comments: string,
	content: string,
): string => comments.replace('}}-->', `}}-->${content}`);

export const isNodeClosedCommentFor = (comment: Comment, node: Node): boolean =>
	comment.textContent?.replace('start', 'end') === node.textContent;
