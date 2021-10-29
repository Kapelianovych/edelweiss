import { layout, page } from '../src';

describe('ssr', () => {
	test('window and document objects are exists on global object', () => {
		expect(globalThis.window).toBeDefined();
		expect(globalThis.document).toBeDefined();
	});

	test('layout() creates layout of global document object', () => {
		layout('<head></head><body>Hello</body>');

		expect(document.documentElement).toBeDefined();
		expect(document.body.innerHTML).toBe('Hello');
	});

	test('page() should return the whole page as a string', () => {
		const html = '<!DOCTYPE html><html><head></head><body>Hello</body></html>';
		layout(html);

		expect(page()).toMatch(html);
	});
});
