/**
 * Perform basic sanitization of the HTML.
 *
 * https://stackoverflow.com/a/6234804
 */
export const sanitize = (html: string): string =>
	html
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');