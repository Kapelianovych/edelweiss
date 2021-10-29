import { readFileSync } from 'fs';
import { isAbsolute, resolve } from 'path';

import './context';

export interface LayoutOptions {
	/**
	 * Tells either value passed to `layout` function is path to
	 * HTML file or not.
	 */
	isPath?: boolean;
	/**
	 * Sanitizes HTML before converting to DOM and attaching
	 * to current document element.
	 * By default, does not do any sanitization.
	 */
	sanitize?: (html: string) => string;
}

/**
 * Defines layout for current document element.
 *
 * @param value must be valid HTML with top-level `<head>` and `<body>` tags
 * or path to `.html` file with basic structure. You can include
 * top-level `<html>` tag, but it will be stripped out.
 *
 * Value of the argument will not be sanitized, it is encouraged
 * that you pass trusted value or sanitize it by yourself.
 *
 * If you pass URL to file as first parameter, then you should
 * set _isPath_ property as `true`. Node, that URL to file can be
 * as absolute path or relative path from _current working directory_.
 */
export const layout = (
	value: string,
	{ isPath = false, sanitize = (html) => html }: LayoutOptions = {},
): void => {
	const html = isPath
		? readFileSync(isAbsolute(value) ? value : resolve(value), {
				encoding: 'utf-8',
		  })
		: value;

	document.documentElement.outerHTML = sanitize(html);
};

/**
 * Returns string representation of current document element.
 * Note that all listeners and `Dependencies` will not be available
 * if you create new DOM tree from string.
 */
export const page = () => document.documentElement.innerHTML;
