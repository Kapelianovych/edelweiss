import { html } from './html';
import { data } from './core/reactive/data';
import { Computed } from './core/reactive/global';
import { Fragment } from './core/template/collect';
import { CustomHTMLElement } from './custom_html_element';

/**
 * RegExp that match against string and take
 * inner part of path without `^` and `$`.
 * Needed for situations when user can provide
 * `^` or `$`, but not both at the same time.
 */
const START_END_REGEXP = /^\^*?([^$^]+)\$*?$/;

const patternToRegExp = (pattern: string): RegExp =>
	new RegExp(pattern.replace(START_END_REGEXP, '^$1$'));

/** Shape of a route. */
export interface Route {
	/**
	 * Used to match against the whole URL.
	 * Pattern must not start with `^` and end with `$`.
	 */
	readonly pattern: string;
	/**
	 * Holds a template for the route.
	 * Can be either `Fragment` directly or function
	 * that accepts parameters that are declared in
	 * _pattern_ property and returns a `Fragment` value.
	 *
	 * @param parameters regexp's capturing groups.
	 */
	readonly template:
		| Fragment
		| ((...parameters: ReadonlyArray<string>) => Fragment);
}

const current = data(window.location.pathname);

/**
 * Creates reactive router.
 * _pattern_ will be converted to `RegExp` and
 * matched against a whole URL.
 */
export const router =
	(...routes: ReadonlyArray<Route>): Computed<Fragment> =>
	() => {
		const path = current();
		const route =
			routes.find((route) => patternToRegExp(route.pattern).test(path)) ??
			// Last route is intended for a default page.
			// Possibly "Not found" page.
			routes[routes.length - 1];

		window.history.pushState({ path }, '', path);

		return typeof route.template === 'function'
			? route.template(
					...(patternToRegExp(route.pattern).exec(path) ?? []).slice(1),
			  )
			: route.template;
	};

/**
 * Navigates to the _path_.
 * If no route is defined for _path_,
 * then route with `notFound` property will
 * be rendered. Otherwise - default _not found_ route.
 */
export const to = (path: string) => current(path);

// Handles routing that are accomplished with browser's buttons
// or through _History API_:
//  - forward
//  - back
window.addEventListener('popstate', (event: PopStateEvent) => {
	if (event.state) {
		to(event.state.path);
	}
});

/**
 * Link element that do navigation according to `href`
 * attribute. Similar to `<a>` element, but works with
 * `router`.
 */
export class RouteLinkElement extends CustomHTMLElement {
	static tagName = 'route-link';

	constructor() {
		super();

		this.addEventListener('click', () => {
			const href = this.getAttribute('href');
			if (href !== null) {
				to(href);
			}
		});
	}

	template(): Fragment {
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

if (customElements.get(RouteLinkElement.tagName) === undefined) {
	customElements.define(RouteLinkElement.tagName, RouteLinkElement);
}
