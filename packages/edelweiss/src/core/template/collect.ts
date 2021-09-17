import { isIterable } from '../utilities/checks';
import { isTemplate, Template } from './entity';

/**
 * Describe values that can be inserted into template
 * as nodes. `string` value will be converted to `Text`
 * node and `Element`s will be attached to outer document.
 * There is special handling of `HTMLTemplateElement` - its
 * children will be attached to DOM, but not template element
 * itself.
 */
export type Fragment =
	| string
	| Element
	| Template
	| DocumentFragment
	| Iterable<string | Element | Template | DocumentFragment>;

const safe = (value: unknown): DocumentFragment => {
	if (isTemplate(value)) {
		return value.clone().build();
	} else if (value instanceof DocumentFragment) {
		return value;
	} else if (value instanceof HTMLTemplateElement) {
		return value.content;
	} else {
		const fragment = document.createDocumentFragment();
		fragment.append(
			value instanceof Element
				? value
				: // Users can provide value of type other than `string`.
				  // In that case value must be explicitly converted to `string`.
				  document.createTextNode(String(value)),
		);
		return fragment;
	}
};

/** Collects all nodes into one fragment. */
export const collect = (value: unknown): DocumentFragment =>
	isIterable(value)
		? Array.from(value)
				.map(safe)
				.reduce((all, current) => {
					all.append(current);
					return all;
				}, document.createDocumentFragment())
		: safe(value);
