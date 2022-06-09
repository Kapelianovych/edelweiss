import { data } from './reactive/data';
import { Computed } from './reactive/global';
import { html, Template } from './html';
import { patternToRegExp } from './pattern';
import { CustomHTMLElement, registerElement } from './custom_html_element';

/** Shape of a route. */
export interface Route {
	readonly exact?: boolean;
	/**
	 * Used to match against the whole URL.
	 * Pattern must not start with `^` and end with `$`.
	 */
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
		| ((...parameters: ReadonlyArray<string>) => Template | Iterable<Template>);
}

/**
 * Navigates to the _path_ or returns
 * the current page path.
 *
 * If no route is defined for the _path_,
 * then the last route will be rendered.
 */
export const current = data(globalThis.location?.pathname ?? '/');

/**
 * Creates reactive router.
 * _pattern_ will be converted to `RegExp` and
 * matched against a whole URL.
 */
export const router =
	(...routes: ReadonlyArray<Route>): Computed<Template | Iterable<Template>> =>
	() => {
		const path = current();

		const route =
			routes.find(({ pattern, exact = false }) =>
				patternToRegExp(pattern, exact).test(path),
			) ??
			// Last route is intended for a default page.
			// Possibly "Not found" page.
			routes[routes.length - 1];

		globalThis.history?.pushState({ path }, '', path);

		return typeof route.template === 'function'
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
		current(event.state.path);
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
				current(href);
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
