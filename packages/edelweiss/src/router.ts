import { data } from './reactive/data';
import { effect } from './reactive/effect';
import { Computed } from './reactive/global';
import { isFunction } from './checks';
import { html, Template } from './html';
import { patternToRegExp } from './pattern';
import { CustomHTMLElement, registerElement } from './custom_html_element';

/** Shape of a route. */
export interface Route {
	readonly exact?: boolean;
	/** Is used to match against the whole URL's pathname. */
	readonly pattern: string;
	/**
	 * Holds a processing for the route.
	 * Can be either `Template | Iterable<Template>` directly or function
	 * that accepts parameters that are declared in
	 * _pattern_ property and returns a `Template | Iterable<Template>` value.
	 *
	 * @param parameters regexp's capturing groups.
	 */
	readonly template:
		| Template
		| Iterable<Template>
		| ((...parameters: readonly string[]) => Template | Iterable<Template>);
}

/**
 * Signals whether navigation was triggered by the native
 * History API or browser's buttons.
 *
 * By default, a first page render is the native navigation
 * because a first History record is written by the browser.
 */
let nativeNavigationTrigger = true;

/**
 * Navigates to the _path_ or returns
 * the current page path.
 */
export const location = data(globalThis.location?.pathname ?? '/');

effect(() => {
	const path = location();

	globalThis.history?.[nativeNavigationTrigger ? 'replaceState' : 'pushState'](
		{ path },
		'',
		path,
	);
});

/**
 * Renders a first matched `Route`.
 *
 * If no route is defined for the current URL,
 * then the last route will be rendered.
 */
export const outlet =
	(...routes: ReadonlyArray<Route>): Computed<Template | Iterable<Template>> =>
	() => {
		const path = location();

		const route =
			routes.find(({ pattern, exact = false }) =>
				patternToRegExp(pattern, exact).test(path),
			) ??
			// Last route is intended for a default page.
			// Possibly the "Not found" page.
			routes.at(-1);

		return route === undefined
			? html``
			: isFunction(route.template)
			? route.template(
					...(
						patternToRegExp(route.pattern, route.exact ?? false).exec(path) ??
						[]
					).slice(1),
			  )
			: route.template;
	};

// Handles routing that are accomplished with browser's buttons
// or through _History API_:
//  - forward
//  - back
globalThis.addEventListener?.('popstate', (event: PopStateEvent) => {
	if (event.state) {
		nativeNavigationTrigger = true;
		location(event.state.path);
		nativeNavigationTrigger = false;
	}
});

/**
 * Link element that do navigation according to `href`
 * attribute. Similar to `<a>` element, but works on
 * the browser with `router`.
 */
export class RouteLinkElement extends CustomHTMLElement {
	static readonly tagName = 'route-link';

	connected() {
		this.addEventListener('click', () => {
			const href = this.getAttribute('href');
			if (href !== null) {
				location(href);
			}
		});
	}

	render(): Template | Iterable<Template> {
		return html`
			<style>
				:host {
					display: inline;
					cursor: pointer;
					text-decoration: underline;
				}
			</style>
			<slot></slot>
		`;
	}
}

registerElement(RouteLinkElement);
