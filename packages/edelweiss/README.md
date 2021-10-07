# Edelweiss

A small library that builds UI.

## Intention

It is not special. It has not the smallest runtime size, it is not the fastest one, but it aims to be as simple as possible 🙂.

## Installation

```sh
npm i @prostory/edelweiss
```

For easier creation of `edelweiss` powered apps, use _Edelweiss CLI_. More info about using CLI [here](../edelweiss-cli).

> Documentation for old `1.8.0` version is here 👉 [here](https://yevhenkap.github.io/). But I don't recommend using it, because of greedy DOM diffing algorithm used by first version.

[Also Edelweiss supports SSR.](../edelweiss-ssr)

## Getting started

As many other libraries do, Edelweiss lets you build HTML in a declarative way.

### HTML

The main function exposed by library is **html**. This is tagged template literal function that accepts HTML as string interpolated with static and dynamic parts and returns a `Template` object that is draft of DOM fragment.

```ts
const template: Template = html`<p>Hello world!</p>`;
```

You need to write a valid HTML there. Though there is a special syntax for handling some cases in a declarative way.

#### Event handling

For attaching an event listener to element write name of the event prepended by `@` symbol as an attribute of an element and pass to it a value of `EventListenerOrEventListenerObject` type. So simple! 😉

```ts
const template = html`<button
	@click=${(event: MouseEvent) => console.log(event.target)}
>
	Click me!
</button>`;
```

#### Attaching value to element's property

You can attach any value to any element's property. Just write a property name prepended by `.` as an attribute of an element and pass to it a desirable value.

```ts
const template = html`<input .hello=${'World!'} />`;
```

#### Handling boolean attributes

For handling presence or absence of an attribute prepend it with `?` character and pass to it falsy (attribute will be removed) or truthy (attribute will retain) value.

```ts
const template = html`<input ?readonly=${true} />`; // readonly attribute remains in element.
const template2 = html`<input ?readonly=${false} />`; // readonly attribute will be removed from element.
```

#### Regular attributes

Handling regular attributes does not require special syntax. Just pass a value to attribute and all done 😉! Just remember that any value that is not type of `string` will be converted to it. So it is encouraged that you will provide only `string` value to attribute.

```ts
const template = html`<span class="foo ${'baz'}"></span>`;
```

#### Hooks

There is possibility to make some action in response of element's lifecycle. There is three events:

- `mounted`: element is inserted into DOM.
- `updated`: any part of element is updated.
- `will-unmount`: element will be removed from DOM after this event.

You can attach to them a callback, that will be executed with the element itself as the first parameter. In order to do that write name of the event prepended by `:` character and pass to it a callback function.

```ts
const template = html`<p
	:mounted=${(element: HTMLParagraphElement) => {
		/* Do some action. */
	}}
></p>`;
```

> If the callback is asynchronous, then it will not be awaited, so there may be inconsistencies if such hook is attached to `will-unmount` hook, because element can be removed before hook is done executing.

You can declare multiple hooks on the same element. But if element will have more than one same hooks (two `mounted` hooks, for example), then only last one will be saved and executed.

#### Children

In child position `html` can accept value of the `Fragment` type:

```ts
type Fragment =
	| string
	| Element
	| Template
	| DocumentFragment
	| Iterable<string | Element | Template | DocumentFragment>;
```

All values, except for `Element`, `Template`, `DocumentFragment`, will be converted to `string` and passed into HTML as `Text` node. `Iterable` value will be unfolded and its values will be processed separately.

> This is done intentionally for preventing inserting arbitrary text as HTML.

```ts
const child = html`<p>${'Child'}</p>`;
const parent = html`<div>${child}</div>`; // -> "<div> <p>Child</p> </div>"

const links = [
	html`<a href="/">Home</a>`,
	html`<a href="/about">About<a></a></a>`,
];
const menu = html`<nav>${links}</nav>`; // Links will be inserted into <nav> element.
```

### Custom elements

Library contains `CustomHTMLElement` class for easy creating [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

```ts
class MyCustomElement extends CustomHTMLElement {
	template(): Fragment {
		return html`<p>It is custom element</p>`;
	}
}
// then register it
customElements.define('my-custom', MyCustomElement);
```

That's it 👐!

The main method you should provide - `template`. It should return HTML that will be attached to [ShadowDOM (opened)](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

For communicating with outer world you can define reactive properties. This is _camelCased_ representation of declared `observedAttributes` getter.

```ts
class MyCustomElement extends CustomHTMLElement {
	// Property will be created automatically and will be bound
	// to according element's attribute.
	declare dataColor: Property; // just `string | null`

	static get observedAttributes() {
		return ['data-color'];
	}

	template(): Fragment {
		return html`<p>It is custom element with ${this.dataColor}</p>`;
	}
}
```

Later if property will change, then according attribute will be updated.

Every property can be type of `null` or type of `string`. If in DOM you want to receive another value that is based on attribute's value, then you can pass transforming function instead of raw `Property`.

```ts
class MyCustomElement extends CustomHTMLElement {
	declare dataColor: Property;

	static get observedAttributes() {
		return ['data-color'];
	}

	template(): Fragment {
		return html`<p>
			It is custom element with ${() =>
				// In HTML will be inserted either 'error' or 'success' value
				this.dataColor === 'red' ? 'error' : 'success'}
		</p>`;
	}
}
```

For updating property's value just assign new value to it.

> Note, that value must be type of `null` or `string`, otherwise they will be converted to string automatically, when assigning to attribute.

If you pass `null` to property, then relative attribute will be removed from element.

```ts
class MyCustomElement extends CustomHTMLElement {
	declare dataColor: Property;

	static get observedAttributes() {
		return ['data-color'];
	}

	makeTransparent(): void {
		// data-color attribute will be removed from element.
		this.dataColor = null;
	}

	setBlueColor(): void {
		// data-color attribute's value will be 'blue' (if attribute does not exist, then it will be created).
		this.dataColor = 'blue';
	}

	template(): Fragment {
		return html`<p>
			It is custom element with ${() => this.dataColor ?? 'transparent'}
		</p>`;
	}
}
```

Also you can freely override custom element's lifecycle methods:

- `connectedCallback`
- `disconnectedCallback`
- `adoptedCallback`
- `attributeChangedCallback`

While overriding last method always call `super.attributeChangedCallback(name, oldValue, newValue)`, otherwise `Property`'s reactivity will be lost.

> If you want to override `constructor`, then you should also call `super()` at first.

### Render

For inserting generated HTML into DOM, call `render` function. It accepts element from DOM to which HTML should be inserted and `HTMLTemplateElement` as container of HTML.

```ts
const template = html`<p>Hello world!</p>`;

render(document.body, template);
```

You can safely insert HTML to element that already has children - `render` function just prepends HTML to the container element.

Also there is `renderToString` function, that converts DOM to string. It accepts only `HTMLTemplateElement`, whose content need to be stringified.

```ts
const template = html`<p>Hello world!</p>`;

const stringifiedTemplate = renderToString(template);
```

> This function is intended to be used with SSR. Though it can be used in browser environment as well.
>
> Note, that event listeners and element's life hooks aren't preserved after converting DOM to string.

### reactivity

Every web application needs a reactive system in order to effectively update UI. There are a bunch of functions that serve that idea.

The most basic function is `data`.

```ts
function data<T>(initial: T): Data<T>;
```

It creates reactive container for some data with initial value. Returned function can be used for retrieving the value and updating it.

```ts
const getSet = data(0);
const value = getSet(); // retrieve inner value
getSet(1); // update value
```

In order to react on updating value inside the container we can define an effect with `effect` function.

```ts
function effect(fn: VoidFunction): void;
```

Like this:

```ts
effect(() => console.log(getSet()));
```

Effect sees that it uses `getSet` function that is derived from reactive container and will execute itself on every value change.

Effect can even recognize containers that is inside conditional block.

```ts
effect(() => {
	if (getSet() > 5) {
		// Effect will track update of `getValue` container
		// until getSet will hold value that is lower that 5.
		const valueFromOtherReactive = getValue();

		// do some stuff
	}
});
```

With such possibility you can also register another effects inside effects. In that case reactive containers will cause reexecuting only own effects (owner effects).

```ts
effect(() => {
	// This container will trigger executing of outer
	// effect and if condition is `true`, then
	// old inner effect is disposed and new one created.
	if (getSet() > 5) {
		effect(() => {
			// Updating of value will cause reexecuting of
			// inner effect only.
			const valueFromOtherReactive = getValue();

			// do some stuff
		});
	}
});
```

In order to prevent container from tracking by an effect we can wrap container's function with `untrack`.

```ts
effect(() => {
	// Effect won't track updates of getSet container.
	const value = untrack(getSet);

	// Do some job
});
```

Also in certain cases an effect can be stateful and before disposing the effect we should flush the state. For this purpose we can use `cleanup` function.

```ts
effect(() => {
	const job = (event: Event) => {
		/* do some work */
	};
	window.addEventListener('click', job);
	// We can stay calm because our listener will be detached.
	cleanup(() => window.removeEventListener('click', job));
});
```

There is a possibility unite a multiple updates into one. This can be done with a `batch` function.

```ts
batch(() => {
	getSet(1);
	getSet(0);
	getSet(4);
	getSet(10); // Only the last one execution will trigger an update.
	const value = getSet(); // Value is still old. Container isn't updated.
});
```

### lazy

Reactivity in the Edelweiss is implement as synchronous system. So, in asynchronous code (aka promises, timeouts) all reactivity will be lost. That problem resolves `lazy` function.

```ts
function lazy<T>(future: () => Promise<T>, initial: T): Resource<T>;
```

`Resource` is a function with special properties that help you track resource state.

```ts
interface Resource<T> {
	(shouldUpdate?: (old: T) => boolean): T;
	readonly error: () => Error;
	readonly loading: () => boolean;
}
```

`lazy` function doesn't immediately start loading resource. Instead it does it after invoking function that is returned by `lazy`.

```ts
const value = lazy(
	() =>
		new Promise<string>((resolve, reject) => {
			/* some */
		}),
	'',
);

// Resource starts loading now.
value();
```

By default, resource is loaded only once. But you can customize this behavior by declaring `shouldUpdate` parameter. This function receives current resource value and if you decide that it should be updated then return `true`.

```ts
effect(() => {
	const updated = value((current) => {
		/* calculation that returns a boolean */
	});

	// ...
});
```

> `lazy` behaves as asynchronous `data`, so effects will track updates of the resource.

For identifying if resource is loading you can use `loading` reactive container of `Resource` function.

```ts
effect(() => {
	// It will be true when resource loads.
	const isLoading = value.loading();
});
```

And if loading fails you can track it with an `error` reactive container.

```ts
effect(() => {
	const error: Error | undefined = value.error();
	if (error) {
		// Do something
	}
});
```

### Router

For basic routing purposes library exports two functions: `router` and `to`.

```ts
function router(...routes: ReadonlyArray<Route>): Computed<Fragment>;
```

This function accepts routes, where route is plain object of `Route` type, and returns `Computed` with current page's HTML.

```ts
const template = html`
	<div>${router({ pattern: '/', template: html`<p>Home page</p>` })}</div>
`;
```

In the above example page will live inside the _\<div>_.

```ts
export interface Route {
	/**
	 * Used to match against whole URL.
	 * Pattern must not start with `^` and end with `$`.
	 */
	readonly pattern: string;
	/**
	 * Holds a template for a route.
	 * Can be either `Fragment` directly or function
	 * that accepts parameters that are declared in
	 * _pattern_ property and returns `Fragment` value.
	 *
	 * @param parameters regexp's capturing groups.
	 */
	readonly template:
		| Fragment
		| ((...parameters: ReadonlyArray<string>) => Fragment);
}
```

As you can see each route should have `pattern` property which is just a string representation of `RegExp`.

> Internally for URL matching such construction is used: `new RegExp(route.pattern)`, so do not forget escape backslashes in _pattern_.

For defining variable parts in URL just embrace them with parenthesis and this variables will be available in `template` function.

> `template` can be a non function type. In that case, you won't have access to the URL parameters.

`template` returns page's HTML: a value of the `Fragment` type.

> If there aren't any route that matches the current URL, then the last route will be rendered.

For navigating between pages use `to` function:

```ts
function to(path: string): void;
```

It accepts an URL of page against which _pattern_ is matched.

```ts
to('/post/12');
```

Also there is a `<route-link>` custom element that does navigation as `to` function, but in declarative way. It needs only `href` attribute.

```ts
// Click on `<route-link>` element will render page that matches "^/$" _pattern_.
const template = html`<route-link href="/">Home</route-link>`;
```

### Store

Every application need to handle a cache (also known as _state_).

Edelweiss exports `store` function that provides simple cache management.

```ts
function store<S extends object>(value: S): Store<S>;
```

It accepts an object whose values are treated as chunks of the cache. To get a data from `Store` object reach a property that are pointed to the needed value.

```ts
const cache = store({ url: '...' });

const url: string = cache.url;
```

For changing value of some property inside store you should assign a new value to it.

```ts
// Value inside cache store will be changed.
cache.url = 'https://new.url';
```

Changing value inside store is reactive. You can listen to this changes through `on` method of `Store`.

```ts
// Create subscription.
const onUrlChange = cache.on('url');
// Subscribe to listen url property changes.
onUrlChange((url) => {
	/* Do something */
});
```

`on` method accepts property names which you want to be dependent on. It returns function that allows to register a listener that will be invoked when some property changes.

```ts
const cache = store({ a: 1, b: '', c: false });

const onABChange = cache.on('a', 'b');

onABChange((a, b) => {
	/* ... */
});
```

Latter returns `unsubscribe` function that stops listening to changes.

```ts
const onUrlChange = cache.on('url');

// ...

const unsubscribe = onUrlChange((url) => {
	/* Do something */
});

// Somewhere in the code...

unsubscribe(); // You do not listen to _url_ changes now.
```

When you delete a property, then listener will be invoked with `undefined` value:

```ts
delete cache.url;
```

For convenience, there is a `createPointer` function that creates `Pointer` instance. It allows to get exact value from the store no matter how deep it is.

You can create many pointers for one store, but usually it isn't necessary to do so.

```ts
const appStore = store({ keyFromStore: { inner: '' } });

const appStorePointer = createPointer(appStore);
```

With pointer you can create reactive container that is depend on a value from the store.

```ts
const value: Data<string> = appStorePointer('keyFromStore');
```

By default, you can get and update the value of `keyFromStore` property in the store. But you can customize what it should return and update by providing `getter` and `setter` arguments.

```ts
const value: Data<string> = appStorePointer(
	'keyFromStore',
	({ inner }) => inner,
	// You should return new state in setter to trigger update
	// in places where reactive container is used.
	(currentState, newValue) => ({ ...currentState, inner: newValue }),
);
```

### Internationalization

For supporting different languages on site, Edelweiss suggests `i18n` module.

To add a new language, call `translations` function. It accepts tuples which have two values inside: first - a language code and second - object of the `Translation` type.

```ts
import { translations } from '@prostory/edelweiss';

// You can call this function as many time as you want to add any number of languages.
translations(
	[
		'en',
		{
			title: 'Great title',
			article: { subtitle: 'Sub', body: 'Lorem ipsum...' },
		},
	],
	[
		'uk',
		{
			title: 'Чудовий заголовок',
			article: { subtitle: 'Підзаголовок', body: 'Щось розумне...' },
		},
	],
	// other tuples
);
```

Function `translate` allows to insert into HTML a translated text. First parameter represents point(**.**)-delimited properties of translation object that points to the text.

```ts
// It inserts into DOM the text in current language automatically. By default, it is browser's language.
const template = html`<p>${translate('article.body')}</p>`;
```

You can insert inside a text some values. In order to do that in translation object define a place for it with the pattern: `{variableName}` and pass a plain object with a key equals to `variableName` and a value - whatever you want to insert into the text.

```ts
translations(['en', { go: 'Go to the {place}.' }]);

const template = html`<p>${translate('go', { place: 'store' })}</p>`;
```

When language of the site need to be changed call `language` function. It accepts language's code.

```ts
// All sentences that was returned by `translate` function will be changed according to language code.
language('en');
```

You can find out current language code with the same function.

```ts
const code = language();
```

Also `languages` function returns an array of language codes that was registered with `translations` function.

```ts
const codes = languages();
```

## Word from author

Have fun! ✌️
