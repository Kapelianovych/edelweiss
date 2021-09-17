import './crypto_for_jest';
import { html, render, renderToString } from '../src';

describe('render', () => {
	test('should append template to container', () => {
		const container = document.createElement('div');

		const template = html`<p>Child.</p>`;

		render(container, template);

		expect(container.querySelector('p')).toBeDefined();
		expect(container.querySelector('p')?.innerHTML).toMatch('Child.');
	});

	test('should append string as text to container', () => {
		const container = document.createElement('div');

		const template = '<p>Child.</p>';

		render(container, template);

		expect(container.querySelector('p')).toBeNull();
		expect(container.innerHTML).toMatch(/Child/);
	});

	test('should append iterable of texts and templates to container', () => {
		const container = document.createElement('div');

		const templates = ['<p>Child.</p>', html`<span></span>`];

		render(container, templates);

		expect(container.querySelector('p')).toBeNull();
		expect(container.querySelector('span')).toBeDefined();
		expect(container.innerHTML).toMatch(/Child/);
	});

	test('renderToString function converts template into raw string', () => {
		const template = html`<p>Content.</p>`;

		const stringifiedTemplate = renderToString(template);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch('<p>Content.</p>');
	});

	test('renderToString function sanitizes and returns DOM as string', () => {
		const template = `<p>Content.</p>`;

		const stringifiedTemplate = renderToString(template);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch('<p>Content.</p>');
	});

	test('renderToString function converts iterable of string and templates into raw string', () => {
		const templates = [html`<p>Content.</p>`, '<span></span>'];

		const stringifiedTemplate = renderToString(templates);

		expect(typeof stringifiedTemplate).toBe('string');
		expect(stringifiedTemplate).toMatch(/<p>Content\.<\/p>/);
		expect(stringifiedTemplate).toMatch(/span/);
	});
});
