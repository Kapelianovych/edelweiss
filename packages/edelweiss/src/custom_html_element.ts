import { render } from './render.browser';
import { Template } from './html';
import { data, Data } from './reactive/data';

/** Converts kebab-case to camelCase. */
const toCamelCase = (name: string): string =>
	name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());

const attachAccessorsTo = (target: CustomHTMLElement): void => {
	const constructor = target.constructor as typeof CustomHTMLElement;

	const reactiveProperties = constructor.observedAttributes.reduce(
		(obj, propertyName) => {
			obj[toCamelCase(propertyName)] = data(target.getAttribute(propertyName));
			return obj;
		},
		{} as Record<string, Data<Property>>,
	);

	Object.keys(reactiveProperties).forEach((key) =>
		Reflect.defineProperty(target, key, {
			set: (other: Property): void => {
				other === null
					? target.removeAttribute(key)
					: target.setAttribute(key, other);
				reactiveProperties[key](other);
			},
			get: () => reactiveProperties[key](),
			enumerable: true,
			configurable: false,
		}),
	);
};

/** Allowed type of value of property. */
export type Property = null | string;

const HTMLElementClass = globalThis.HTMLElement ?? class {};

/**
 * Parent class for custom elements.
 * At least `processing` method need to be defined.
 */
export abstract class CustomHTMLElement extends HTMLElementClass {
	/**
	 * Contains a markup name of the element.
	 * Should be provided with template method.
	 */
	static readonly tagName: string;

	/**
	 * Returns an array of attribute names to monitor for changes.
	 * For declared attributes same reactive properties will be created.
	 * Default value of new properties is empty string.
	 * Property is always reflect same attribute's value and
	 * vise versa.
	 * Name of properties will be in _camelCase_ notation.
	 */
	static get observedAttributes(): ReadonlyArray<string> {
		return [];
	}

	private connectedCallback() {
		if (this.isConnected) {
			attachAccessorsTo(this);

			render(
				this.render(),
				this.attachShadow({
					mode: 'open',
				}),
			);

			this.connected?.();
		}
	}

	/**
	 * Called this method when the element is added to the document
	 * (can be called many times if an element is repeatedly added/removed).
	 */
	protected connected?(): void;

	private disconnectedCallback() {
		this.disconnected?.();
	}

	/**
	 * Called this method when the element is removed from the document
	 * (can be called many times if an element is repeatedly added/removed).
	 */
	protected disconnected?(): void;

	private adoptedCallback() {
		this.adopted?.();
	}

	/**
	 * Called when the element is moved to a new document
	 * (happens in `document.adoptNode`).
	 */
	protected adopted?(): void;

	private attributeChangedCallback(
		this: CustomHTMLElement & { [key: string]: Property },
		name: string,
		oldValue: Property,
		newValue: Property,
	): void {
		if (!Object.is(oldValue, newValue)) {
			this[toCamelCase(name)] = newValue;
		}

		this.attributeChanged?.(name, oldValue, newValue);
	}

	/**
	 * Called when one of attributes returned by `observedAttributes`
	 * is modified.
	 */
	protected attributeChanged?(
		name: string,
		oldValue: Property,
		newValue: Property,
	): void;

	/** Defines inner DOM of custom element as Shadow DOM. */
	protected abstract render(): Template | Iterable<Template>;
}

/**
 * Registers `elementClass` in global custom element registry.
 * Allowed to use in server environment.
 */
export const registerElement = <T extends typeof CustomHTMLElement>(
	elementClass: T,
): void => {
	if (globalThis.customElements?.get(elementClass.tagName) === undefined) {
		globalThis.customElements?.define(
			elementClass.tagName,
			elementClass as unknown as CustomElementConstructor,
		);
	}
};
