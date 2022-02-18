import { html, router, current } from '../src';

describe('router', () => {
	beforeAll(() => (window.location.pathname = '/'));

	test('should insert processing based on current location', () => {
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

		expect(template.build<Node>().childNodes.length).toBe(
			3 /* start comment + text + end comment */,
		);
		expect(template.build<Node>().childNodes.item(1).textContent).toMatch(
			'start',
		);
	});

	test('should update processing', () => {
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

		expect(template.build<Node>().childNodes.item(1).textContent).toMatch(
			'start',
		);

		current('/one');

		expect(template.build<Node>().childNodes.length).toBe(
			3 /* start comment + text + end comment */,
		);
		expect(template.build<Node>().childNodes.item(1).textContent).toMatch(
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

		expect(template.build<Element>().firstElementChild?.innerHTML).toMatch(
			/one/,
		);
	});

	it('should render custom route', () => {
		const template = html`
			<div><route-link href="/custom">Click me</route-link></div>
		`;

		expect(template.build<Element>().querySelector('route-link')).toBeDefined();
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

		const builtTemplate = template.build<Node>();

		current('/');

		expect(builtTemplate.textContent).toContain('start');

		current('/one');

		expect(builtTemplate.textContent).toContain('one');

		current('/');

		expect(builtTemplate.textContent).toContain('start');

		current('/one');

		expect(builtTemplate.textContent).toContain('one');
	});

	it('should render property processing (not a function)', () => {
		const page = router({
			pattern: '/',
			template: html`Property template`,
		});

		const template = html`<div>${page}</div>`;

		current('/');

		const builtTemplate = template.build<Node>();

		expect(builtTemplate.textContent).toContain('Property template');
	});
});
