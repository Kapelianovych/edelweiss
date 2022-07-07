import { data } from './reactive/data';
import { render } from './render.browser';
import { Template } from './html';

/** Converts kebab-case to camelCase. */
const toCamelCase = (name: string): string =>
	name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());

export interface Observed<T> {
	readonly attribute: string;
	readonly mapToProperty: (value: string | null) => T;
	readonly mapToAttribute: (value: T) => string | null;
}

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

	private static readonly observed: Observed<any>[] = [];

	private static get observedAttributes(): readonly string[] {
		return this.observed.map(({ attribute }) => attribute);
	}

	/**
	 * Creates a two-way data binding between an *attribute* and
	 * a camel cased reactive property.
	 */
	protected static observe<T = string | null>(
		attribute: string,
		{
			mapToProperty = (value) => value as unknown as T,
			mapToAttribute = String,
		}: Partial<Omit<Observed<T>, 'attribute'>> = {},
	) {
		this.observed.push({ attribute, mapToAttribute, mapToProperty });
	}

	constructor() {
		super();

		(this.constructor as typeof CustomHTMLElement).observed.forEach(
			({ attribute, mapToProperty, mapToAttribute }) => {
				const property = toCamelCase(attribute);

				const value = data(mapToProperty(this.getAttribute(attribute)));

				Reflect.defineProperty(this, property, {
					set: (other): void => {
						const attributeValue = mapToAttribute(other);

						attributeValue === null
							? this.removeAttribute(attribute)
							: this.setAttribute(attribute, attributeValue);

						value(other);
					},
					get: value,
					enumerable: true,
					configurable: false,
				});
			},
		);
	}

	private connectedCallback() {
		if (this.isConnected) {
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
		this: CustomHTMLElement & { [key: string]: unknown },
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (!Object.is(oldValue, newValue)) {
			const observedAttributeDescriptor = (
				this.constructor as typeof CustomHTMLElement
			).observed.find(({ attribute }) => attribute === name);

			if (observedAttributeDescriptor !== undefined) {
				this[toCamelCase(name)] =
					observedAttributeDescriptor.mapToProperty(newValue);
			}

			this.attributeChanged?.(name, oldValue, newValue);
		}
	}

	/**
	 * Called when one of attributes returned by `observedAttributes`
	 * is modified.
	 */
	protected attributeChanged?(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void;

	/** Defines the inner DOM of a custom element as Shadow DOM. */
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
