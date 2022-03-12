export { batch } from './core/reactive/batch';
export { effect } from './core/reactive/effect';
export { untrack } from './core/reactive/untrack';
export { cleanup } from './core/reactive/cleanup';
export { isServer } from './core/environment';
export { current, router } from './router';
export { render, hydrate } from './render';
export { data, type Data } from './core/reactive/data';
export { html, type Template } from './core/html';
export { lazy, type Resource } from './lazy';
export { meta, type MetaRecord } from './meta';
export {
	registerElement,
	CustomHTMLElement,
	type Property,
} from './custom_html_element';
export {
	language,
	languages,
	translate,
	translations,
	type Texts,
	type Translation,
} from './i18n';

export type { Hook } from './core/hooks';
export type { Fragment } from './core/processing/collect';
export type { Effect, Computed } from './core/reactive/global';
