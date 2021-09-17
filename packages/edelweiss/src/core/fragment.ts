import { Content } from './content';

export interface RawDOMFragment {
	readonly markers: Content['markers'];
	readonly content: DocumentFragment;
}

/** Creates nodes from text HTML. */
export const createFragment = (content: Content): RawDOMFragment => {
	const template = document.createElement('template');
	// It is safe because content of _html_ property is build on static
	// parts of template literal function. There are not any user-defined
	// values yet.
	template.innerHTML = content.html;

	return {
		markers: content.markers,
		content: template.content,
	};
};
