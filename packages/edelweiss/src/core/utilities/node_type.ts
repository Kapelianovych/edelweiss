export const isElement = (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE;

export const isComment = (node: Node): node is Comment =>
	node.nodeType === Node.COMMENT_NODE;
