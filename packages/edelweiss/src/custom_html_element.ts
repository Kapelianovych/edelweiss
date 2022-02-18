import { render } from './render';
import { renderer } from './core/renderer';
import { Fragment } from './core/processing/collect';
import { data, Data } from './core/reactive/data';

/** Converts kebab-case to camelCase. */
const toCamelCase = (name: string): string =>
	name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());

const attachAccessorsTo = (target: CustomHTMLElement & Properties): void => {
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

/**
 * Generic object with any amount of properties
 * whose value type is `string` or `null`.
 */
interface Properties {
	[name: string]: Property;
}

/**
 * Parent class for custom elements.
 * At least `processing` method need to be defined.
 */
export abstract class CustomHTMLElement extends renderer.getHTMLElement() {
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

	/**
	 * When overriding constructor always call **super()** at start,
	 * so that the correct prototype chain will be established.
	 */
	constructor() {
		super();

		attachAccessorsTo(this as unknown as CustomHTMLElement & Properties);

		render(
			this.template(),
			this.attachShadow({
				mode: 'open',
			}),
		);
	}

	/**
	 * Called this method when the element is added to the document
	 * (can be called many times if an element is repeatedly added/removed).
	 */
	protected declare connectedCallback: VoidFunction;

	/**
	 * Called this method when the element is removed from the document
	 * (can be called many times if an element is repeatedly added/removed).
	 */
	protected declare disconnectedCallback: VoidFunction;

	/**
	 * Called when the element is moved to a new document
	 * (happens in `document.adoptNode`).
	 */
	protected declare adoptedCallback: VoidFunction;

	/**
	 * Called when one of attributes returned by `observedAttributes`
	 * is modified.
	 *
	 * Call `super.attributeChangedCallback` while overriding this
	 * method.
	 */
	protected attributeChangedCallback(
		this: CustomHTMLElement & Properties,
		name: string,
		oldValue: Property,
		newValue: Property,
	): void {
		if (!Object.is(oldValue, newValue)) {
			this[toCamelCase(name)] = newValue;
		}
	}

	/** Defines inner DOM of custom element as Shadow DOM. */
	protected abstract template(): Fragment;
}
