import { html, render } from '../src';

describe('render', () => {
	test('should append processing to container', () => {
		const container = document.createElement('div');

		const template = html`<p>Child.</p>`;

		render(template, container);

		expect(container.querySelector('p')).toBeDefined();
		expect(container.querySelector('p')?.innerHTML).toMatch('Child.');
	});

	test('should append string as text to container', () => {
		const container = document.createElement('div');

		const template = '<p>Child.</p>';

		render(template, container);

		expect(container.querySelector('p')).toBeNull();
		expect(container.innerHTML).toMatch(/Child/);
	});

	test('should append iterable of texts and templates to container', () => {
		const container = document.createElement('div');

		const templates = ['<p>Child.</p>', html`<span></span>`];

		render(templates, container);

		expect(container.querySelector('p')).toBeNull();
		expect(container.querySelector('span')).toBeDefined();
		expect(container.innerHTML).toMatch(/Child/);
	});

	test('render function converts processing into raw string', () => {
		const template = html`<p>Content.</p>`;

		const stringifiedTemplate = render(template);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch('<p>Content.</p>');
	});

	test('render function should be able to accept string as nodes', () => {
		const template = `<p>Content.</p>`;

		const stringifiedTemplate = render(template);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch('<p>Content.</p>');
	});

	test('render function should convert iterable of string and templates into raw string', () => {
		const templates = [html`<p>Content.</p>`, '<span></span>'];

		const stringifiedTemplate = render(templates);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch(/<p>Content\.<\/p>/);
		expect(stringifiedTemplate).toMatch(/span/);
	});
});
