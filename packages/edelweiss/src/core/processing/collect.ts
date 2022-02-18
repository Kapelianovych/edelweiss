import { Template } from '../template';
import { isIterable, isObject } from '../utilities/checks';
import { CustomDocumentFragment, renderer } from '../renderer';

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

const toFragment = (
	value: unknown,
): DocumentFragment | CustomDocumentFragment => {
	const fragment = renderer.createDocumentFragment();

	if (isObject<Template>(value) && value.isTemplate) {
		fragment.append(value.build());
		// We need to check for the HTMLTemplateElement before
		// the Element, because the former is child of the latter.
	} else if (value instanceof renderer.getHTMLTemplateElement()) {
		fragment.append((value as HTMLTemplateElement).content);
	} else if (
		value instanceof renderer.getElement() ||
		value instanceof renderer.getDocumentFragment()
	) {
		fragment.append(value);
	} else {
		// Users can provide value of type other than `string`.
		// In that case value must be explicitly converted to `string`.
		fragment.append(renderer.createText(value));
	}

	return fragment;
};

/** Collects all nodes into one fragment. */
export const collect = (value: unknown): DocumentFragment | string => {
	const fragment = isIterable(value)
		? Array.from(value)
				.map(toFragment)
				.reduce((all: CustomDocumentFragment | DocumentFragment, current) => {
					all.append(current as DocumentFragment);
					return all;
				}, renderer.createDocumentFragment())
		: toFragment(value);

	return fragment instanceof renderer.getDocumentFragment()
		? fragment
		: fragment.value();
};
