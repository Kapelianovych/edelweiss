import { effect } from './reactive/effect';
import { sanitize } from './sanitizer';
import { isFunction, isIterable } from './checks';
import {
	Hook,
	Hooks,
	callHook,
	registerHook,
	callHookOnElementWithChildren,
} from './hooks';
import {
	Marker,
	Template,
	Container,
	ValueType,
	isTemplate,
	AttributeMark,
	PROPERTY_VALUE_SEPARATOR,
} from './html';

const DATA_SKIP_ATTRIBUTE_NAME = 'data-skip';
const DATA_SKIP_ONLY_ATTRIBUTE_NAME = 'data-skip-only';
export const DATA_FILLED_ATTRIBUTE_NAME = '__data-prefilled';

const shouldBeHydrated = (): boolean =>
	!document.body.hasAttribute(DATA_FILLED_ATTRIBUTE_NAME);

const parse = (html: string): DocumentFragment =>
	document.createRange().createContextualFragment(html);

const attachEventListener = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<Marker, Container>,
): void => {
	const eventMarker = markers.get(value);

	if (eventMarker !== undefined) {
		currentNode.addEventListener(
			name.replace(AttributeMark.EVENT, ''),
			eventMarker.value as EventListenerOrEventListenerObject,
		);

		currentNode.removeAttribute(name);
	}
};

const attachHook = (
	node: Element,
	name: string,
	value: string,
	markers: Map<Marker, Container>,
): void => {
	const hookMarker = markers.get(value);

	if (hookMarker !== undefined) {
		const hookName = name.replace(AttributeMark.HOOK, '');

		switch (hookName) {
			case Hooks.MOUNTED:
			case Hooks.UPDATED:
			case Hooks.WILL_UNMOUNT:
				registerHook(hookName, node, hookMarker.value as Hook);
				break;
			default:
				console.warn(`Unknown hook name: ${hookName}.`);
		}

		node.removeAttribute(name);
	}
};

const toggleAttribute = (
	target: Element,
	name: string,
	shouldAttributeBePresent: boolean,
) =>
	shouldAttributeBePresent
		? target.setAttribute(name, '')
		: target.removeAttribute(name);

const handleToggleAttribute = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<Marker, Container>,
): void => {
	const marker = markers.get(value);

	if (marker !== undefined) {
		const attributeName = name.replace(AttributeMark.TOGGLE, '');

		const { value } = marker;

		effect(() => {
			const shouldAttributeBePresent = Boolean((value as Function)());

			if (shouldBeHydrated()) {
				toggleAttribute(currentNode, attributeName, shouldAttributeBePresent);
				callHook(Hooks.UPDATED, currentNode);
			}
		});

		currentNode.removeAttribute(name);
	}
};

const updateProperty = (target: Element, property: string, value: unknown) =>
	((target as Element & { [property: string]: unknown })[property] = value);

const handleProperty = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<Marker, Container>,
): void => {
	const [propertyName, marker] = value.split(PROPERTY_VALUE_SEPARATOR);

	const propertyMarker = markers.get(marker);

	if (propertyMarker !== undefined) {
		const { value } = propertyMarker;

		isFunction(value)
			? effect(() => {
					updateProperty(currentNode, propertyName, value());
					callHook(Hooks.UPDATED, currentNode);
			  })
			: updateProperty(currentNode, propertyName, value);

		currentNode.removeAttribute(name);
	}
};

const handleRegularAttribute = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<Marker, Container>,
): void => {
	const attributeMarkers = Array.from(markers.values()).filter(({ marker }) =>
		value.includes(marker),
	);

	effect(() => {
		const attributeValue = attributeMarkers
			.reduce(
				(attributeValue, { marker, value }) =>
					attributeValue.replace(
						marker,
						sanitize(String((value as Function)())),
					),
				value,
			)
			.trim();

		if (shouldBeHydrated()) {
			currentNode.setAttribute(
				name.replace(AttributeMark.REGULAR, ''),
				attributeValue,
			);
			callHook(Hooks.UPDATED, currentNode);
		}
	});

	if (name.startsWith(AttributeMark.REGULAR)) {
		currentNode.removeAttribute(name);
	}
};

const isNodeClosedCommentFor = (comment: Comment, node: Node): boolean =>
	comment.textContent?.replace('start', 'end') === node.textContent;

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

const closedCommentWith = (key: string): string =>
	`<!--${key}-->` + `<!--${key.replace('start', 'end')}-->`;

const packFragment = (fragment: unknown): DocumentFragment => {
	const documentFragment = document.createDocumentFragment();

	if (isTemplate(fragment)) {
		documentFragment.append(traverse(parse(fragment.html), fragment.markers));
	} else if (fragment instanceof DocumentFragment) {
		documentFragment.append(fragment);
	} else if (fragment instanceof HTMLTemplateElement) {
		documentFragment.append(fragment.content);
	} else if (fragment instanceof Node) {
		documentFragment.append(fragment);
	} else {
		documentFragment.append(document.createTextNode(String(fragment)));
	}

	return documentFragment;
};

const collectFragments = (fragments: unknown): DocumentFragment =>
	isIterable(fragments)
		? Array.from(fragments)
				.map(packFragment)
				.reduce((accumulator, current) => {
					accumulator.append(current);

					return accumulator;
				}, document.createDocumentFragment())
		: packFragment(fragments);

const handleNodes = (
	currentNode: Comment,
	markers: Map<Marker, Container>,
): void => {
	const nodeMarker = markers.get(
		closedCommentWith(currentNode.textContent ?? ''),
	);

	if (nodeMarker !== undefined) {
		const { value } = nodeMarker;

		isFunction(value)
			? effect(() => {
					const nodes = value();

					if (shouldBeHydrated()) {
						unmountOldNodes(currentNode);
						currentNode.after(collectFragments(nodes));
						callMountedHook(currentNode);
					}
			  })
			: currentNode.after(collectFragments(value));
	}
};

const isComment = (node: Node): node is Comment =>
	node.nodeType === Node.COMMENT_NODE;

const traverse = (fragment: Node, markers: Map<Marker, Container>): Node => {
	const walker = document.createTreeWalker(
		fragment,
		NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_COMMENT,
	);

	while (walker.nextNode() !== null) {
		const currentNode = walker.currentNode as Element | Comment;

		if (
			!isComment(currentNode) &&
			currentNode.hasAttribute(DATA_SKIP_ONLY_ATTRIBUTE_NAME)
		) {
			continue;
		} else if (
			!isComment(currentNode) &&
			currentNode.hasAttribute(DATA_SKIP_ATTRIBUTE_NAME)
		) {
			break;
		}

		isComment(currentNode)
			? handleNodes(currentNode, markers)
			: Array.from(currentNode.attributes).forEach(({ name, value }) => {
					switch (name.charAt(0)) {
						case AttributeMark.HOOK:
							attachHook(currentNode, name, value, markers);
							break;
						case AttributeMark.EVENT:
							attachEventListener(currentNode, name, value, markers);
							break;
						case AttributeMark.TOGGLE:
							handleToggleAttribute(currentNode, name, value, markers);
							break;
						case AttributeMark.PROPERTY:
							handleProperty(currentNode, name, value, markers);
							break;
						default:
							handleRegularAttribute(currentNode, name, value, markers);
							break;
					}
			  });
	}

	return fragment;
};

export const render = (
	fragment: Template | Iterable<Template>,
	to: Element | ShadowRoot,
): void => {
	if (isIterable(fragment)) {
		Array.from(fragment)
			.reverse()
			.forEach((part) => render(part, to));
	} else {
		to.prepend(traverse(parse(fragment.html), fragment.markers));
		callHookOnElementWithChildren(Hooks.MOUNTED, to);
	}
};

const collectMarkers = (fragment: Template): Map<Marker, Container> => {
	const markers = fragment.markers;

	Array.from(markers.values())
		.filter(
			({ valueType, value }) =>
				valueType === ValueType.NODE && isFunction(value),
		)
		.forEach(({ value }) => {
			const result = (value as Function)();

			if (isTemplate(result)) {
				collectMarkers(result).forEach((value, key) => markers.set(key, value));
			} else if (isIterable(result)) {
				Array.from(result)
					.filter(isTemplate)
					.forEach((template) =>
						collectMarkers(template).forEach((value, key) =>
							markers.set(key, value),
						),
					);
			}
		});

	return markers;
};

export const hydrate = (fragment: Template | Iterable<Template>): void => {
	const markers = isTemplate(fragment)
		? collectMarkers(fragment)
		: new Map<Marker, Container>();

	if (isIterable(fragment)) {
		Array.from(fragment).forEach((part) =>
			collectMarkers(part).forEach((value, key) => markers.set(key, value)),
		);
	}

	traverse(document, markers);

	document.body.removeAttribute(DATA_FILLED_ATTRIBUTE_NAME);
};
