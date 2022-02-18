export interface CustomDocumentFragment {
	readonly id: symbol;
	readonly value: () => string;
	readonly append: (value: string | Node | CustomDocumentFragment) => void;
}

const customDocumentFragmentId = Symbol();

const createDocumentFragment = (): CustomDocumentFragment => {
	let innerValue = '';

	return {
		id: customDocumentFragmentId,
		value: () => innerValue,
		append: (value) => {
			innerValue +=
				typeof value === 'string'
					? value
					: customDocumentFragmentId in value
					? (value as CustomDocumentFragment).value()
					: String(value);
		},
	};
};

export const renderer = {
	getComment: () => globalThis.Comment ?? class {},
	getElement: () => globalThis.Element ?? class {},
	getHTMLElement: () => globalThis.HTMLElement ?? class {},
	getDocumentFragment: () => globalThis.DocumentFragment ?? class {},
	getHTMLTemplateElement: () => globalThis.HTMLTemplateElement ?? class {},

	parse: (html: string): DocumentFragment => {
		const template = globalThis.document?.createElement('template') ?? {};
		template.innerHTML = html;
		return template.content;
	},

	createText: (value: unknown): string | Text =>
		globalThis.document?.createTextNode(String(value)) ?? String(value),

	createDocumentFragment: (): DocumentFragment | CustomDocumentFragment =>
		globalThis.document?.createDocumentFragment() ?? createDocumentFragment(),
};
