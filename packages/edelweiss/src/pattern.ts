/**
 * RegExp that match against string and take
 * inner part of path without `^` and `$`.
 * Needed for situations when user can provide
 * `^` or `$`, but not both at the same time.
 */
const START_END_REGEXP = /^\^*?([^$^]+)\$*?$/;

export const patternToRegExp = (pattern: string, exact: boolean): RegExp =>
	new RegExp(
		pattern
			.replace(START_END_REGEXP, exact ? '^$1$' : '$1')
			.replace(/([^\\]?)\//g, '$1\\/'),
	);
