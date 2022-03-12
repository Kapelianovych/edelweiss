import { isServer } from '../environment';
import { sanitize } from '../utilities/sanitizer';
import { isIterable } from '../utilities/checks';
import { Template, isTemplate } from '../html';

/**
 * Describe values that can be inserted into processing
 * as nodes. `string` value will be converted to `Text`
 * node and `Element`s will be attached to outer document.
 * There is special handling of `HTMLTemplateElement` - its
 * children will be attached to DOM, but not the processing element
 * itself.
 */
export type Fragment =
	| string
	| Element
	| Template
	| DocumentFragment
	| Iterable<string | Element | Template | DocumentFragment>;

const toFragment = (value: unknown): string | Node => {
	if (isServer()) {
		return isTemplate(value) ? value.html : sanitize(String(value));
	} else {
		if (isTemplate(value)) {
			const template = globalThis.document.createElement('template');
			template.innerHTML = value.html;
			return template.content;
		} else if (value instanceof globalThis.HTMLTemplateElement) {
			return value.content;
		} else if (
			value instanceof globalThis.Element ||
			value instanceof globalThis.DocumentFragment
		) {
			return value;
		} else {
			return globalThis.document.createTextNode(String(value));
		}
	}
};

/** Collects all nodes into one fragment. */
export const collect = (value: unknown): Node | string =>
	isIterable(value)
		? Array.from(value)
				.map(toFragment)
				.reduce(
					(all: string | DocumentFragment, current) => {
						if (!isServer()) {
							(all as DocumentFragment).append(current);
						}

						return isServer() ? (all as string) + current : all;
					},
					isServer() ? '' : globalThis.document.createDocumentFragment(),
				)
		: toFragment(value);
