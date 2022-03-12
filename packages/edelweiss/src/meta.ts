import { current } from './router';
import { Computed } from './core/reactive/global';
import { Fragment } from './core/processing/collect';
import { patternToRegExp } from './core/utilities/pattern';

export interface MetaRecord {
	readonly route: string;
	readonly template: Fragment;
}

/**
 * Returns tags that should be rendered in `<head>`
 * depending on the current route path.
 */
export const meta =
	(...templates: readonly MetaRecord[]): Computed<Fragment> =>
	() => {
		const path = current();

		const { template } =
			templates.find(({ route }) => patternToRegExp(route).test(path)) ??
			templates[templates.length - 1];

		return template;
	};
