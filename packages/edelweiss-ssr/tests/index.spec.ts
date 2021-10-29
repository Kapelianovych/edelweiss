import { layout, page } from '../src';

describe('ssg', () => {
	beforeEach(() => {
		layout('<html><head></head><body></body></html>');
		document.documentElement
			.getAttributeNames()
			.forEach((name) => document.documentElement.removeAttribute(name));
	});

	test('window and document objects are exists on global object', () => {
		expect(globalThis.window).toBeDefined();
		expect(globalThis.document).toBeDefined();
	});

	test('layout() creates layout of global document object', () => {
		layout('<!DOCTYPE html><html><head></head><body>Hello</body></html>');

		expect(document.documentElement).toBeDefined();
		expect(document.body.innerHTML).toBe('Hello');
	});

	test('page() should return the whole page as a string', () => {
		const html =
			'<!DOCTYPE html><html lang="en"><head></head><body>Hello</body></html>';
		layout(html);

		expect(page()).toMatch(html);
	});

	test("page() should return string with DOCTYPE event if HTML hasn't it", () => {
		const html = '<html><head></head><body>Hello</body></html>';
		layout(html);

		expect(page()).toMatch('<!DOCTYPE html>' + html);
	});
});
