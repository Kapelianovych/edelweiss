import { current } from './router';
import { Template } from './html';
import { Computed } from './reactive/global';
import { isIterable } from './checks';
import { patternToRegExp } from './pattern';

export interface MetaRecord {
	readonly route: string;
	readonly exact?: boolean;
	readonly template: Template | Iterable<Template>;
}

/**
 * Returns tags that should be rendered in `<head>`
 * depending on the current route path.
 */
export const meta =
	(...templates: readonly MetaRecord[]): Computed<readonly Template[]> =>
	() => {
		const path = current();

		return templates
			.filter(({ route, exact = false }) =>
				patternToRegExp(route, exact).test(path),
			)
			.flatMap(({ template }) =>
				isIterable(template) ? Array.from(template) : template,
			);
	};
