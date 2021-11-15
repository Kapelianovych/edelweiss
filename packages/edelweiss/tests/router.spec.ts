import './crypto_for_jest';
import { html, router, current } from '../src';

describe('router', () => {
	beforeAll(() => (window.location.pathname = '/'));

	test('should insert template based on current location', () => {
		const page = router(
			{
				pattern: '/',
				template: () => html`start`,
			},
			{
				pattern: '/one',
				template: () => html`one`,
			},
		);

		const template = html` <div>${page}</div> `;

		expect(template.clone().build().childNodes.length).toBe(
			3 /* start comment + text + end comment */,
		);
		expect(template.clone().build().childNodes.item(1).textContent).toMatch(
			'start',
		);
	});

	test('should update template', () => {
		const page = router(
			{
				pattern: '/',
				template: () => html`start`,
			},
			{
				pattern: '/one',
				template: () => html`one`,
			},
		);

		const template = html` <div>${page}</div> `;

		expect(template.clone().build().childNodes.item(1).textContent).toMatch(
			'start',
		);

		current('/one');

		expect(template.clone().build().childNodes.length).toBe(
			3 /* start comment + text + end comment */,
		);
		expect(template.clone().build().childNodes.item(1).textContent).toMatch(
			'one',
		);
	});

	test('should insert last route if there is no match', () => {
		const page = router(
			{
				pattern: '/',
				template: () => html`start`,
			},
			{
				pattern: '/one',
				template: () => html`one`,
			},
		);

		const template = html` <div>${page}</div> `;

		current('/second');

		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			/one/,
		);
	});

	it('should render custom route', () => {
		const template = html`
			<div><route-link href="/custom">Click me</route-link></div>
		`;

		expect(template.clone().build().querySelector('route-link')).toBeDefined();
	});

	it('should move from page to page', () => {
		const page = router(
			{
				pattern: '/',
				template: () => html`start`,
			},
			{
				pattern: '/one',
				template: () => html`one`,
			},
		);

		const template = html` <div>${page}</div> `;

		const buildedTemplate = template.clone().build();

		current('/');

		expect(buildedTemplate.textContent).toContain('start');

		current('/one');

		expect(buildedTemplate.textContent).toContain('one');

		current('/');

		expect(buildedTemplate.textContent).toContain('start');

		current('/one');

		expect(buildedTemplate.textContent).toContain('one');
	});

	it('should render property template (not a function)', () => {
		const page = router({
			pattern: '/',
			template: html`Property template`,
		});

		const template = html`<div>${page}</div>`;

		current('/');

		const buildedTemplate = template.clone().build();

		expect(buildedTemplate.textContent).toContain('Property template');
	});
});
