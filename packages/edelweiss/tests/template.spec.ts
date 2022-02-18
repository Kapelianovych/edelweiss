import { data, html, render } from '../src';

const createSVG = () =>
	document.createElementNS('http://www.w3.org/2000/svg', 'svg');

describe('html', () => {
	beforeAll(() => (document.body.innerHTML = ''));

	test('html creates DOM nodes', () => {
		const template = html`<p></p>`;

		expect(template.build<DocumentFragment>().childElementCount).toBe(1);
		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.isEqualNode(document.createElement('p')),
		).toBe(true);
	});

	it('should not build final DOM while creating processing', () => {
		let isChanged = false;

		html`<p :mounted=${() => void (isChanged = !isChanged)}></p>`;

		expect(isChanged).toBe(false);
	});

	test('html inserts processing as node into HTML', () => {
		const template = html`<p>${html`yo`}</p>`;

		expect(template.build<DocumentFragment>().childNodes.length).toBe(1);
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch('yo');
		expect(
			template.build<DocumentFragment>().firstElementChild?.childNodes.item(0)
				.nodeType,
		).toBe(Node.TEXT_NODE);
	});

	test('html inserts array of nodes into HTML', () => {
		const template = html`<p>${[html`foo`, 'bar', html`baz`]}</p>`;

		expect(
			template.build<DocumentFragment>().firstElementChild?.childNodes.length,
		).toBe(3);
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch('foo');
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch('bar');
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch('baz');
	});

	test('html should insert single attribute value', () => {
		const template = html`<p class="${'header'}"></p>`;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('class'),
		).toMatch('header');
	});

	test('html should insert attribute value with static parts', () => {
		const template = html`<p class="useful ${'value'}"></p>`;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('class'),
		).toMatch('useful value');
	});

	test('html should preserve places for dynamic values in attributes', () => {
		const changing = data('foo');
		const template = html`<p
			class="static ${'dynamic'} ${changing} another"
		></p>`;

		const p = template.build<DocumentFragment>().firstElementChild!;

		expect(p.getAttribute('class')).toBe('static dynamic foo another');

		changing('baz');

		expect(p.getAttribute('class')).toBe('static dynamic baz another');
	});

	test('html should preserve boolean attribute if value is truthy', () => {
		const template = html`<p ?readonly="${true}"></p>`;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.hasAttribute('readonly'),
		).toBe(true);
	});

	test('html should remove boolean attribute if value is falsy', () => {
		const template = html`<p ?readonly="${false}"></p>`;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.hasAttribute('readonly'),
		).toBe(false);
	});

	test('html should attach event listener to node', () => {
		let clicked = false;

		const template = html`<button @click="${() => (clicked = true)}"></button>`;

		expect(clicked).toBe(false);

		(
			template.build<DocumentFragment>().firstElementChild as HTMLButtonElement
		)?.click();

		expect(clicked).toBe(true);
	});

	test('html should set property to node', () => {
		const template = html`<span .title="${'foo'}"></span>`;

		// @ts-ignore
		expect(template.build<DocumentFragment>().firstElementChild?.title).toBe(
			'foo',
		);
	});

	it('should insert null and other values except HTMLTemplateElement as text node', () => {
		const template = html` <span>${null}${undefined}${12345}${true}</span> `;

		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch(/null/);
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch(/undefined/);
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch(/12345/);
		expect(
			template.build<DocumentFragment>().firstElementChild?.innerHTML,
		).toMatch(/true/);
	});

	test('should add attribute hook to element', () => {
		const template = html`<div :mounted=${() => {}}></div>`;

		expect(
			template.build<DocumentFragment>().querySelector('[data-es-mounted]'),
		).toBeDefined();
	});

	test('should invoke hook if element is mounted to DOM', () => {
		let isButtonMounted = false;

		const template = html`<button :mounted=${() => (isButtonMounted = true)}>
			Mounted
		</button>`;

		render(template, document.body);

		expect(isButtonMounted).toBe(true);
	});

	test('updated hook should not be invoked on node tree construction', () => {
		let isElementUpdated = false;

		const e = data('');

		const template = html`
			<button class=${e} :updated=${() => (isElementUpdated = true)}>
				Updated
			</button>
		`;

		template.build<DocumentFragment>();

		expect(isElementUpdated).toBe(false);
	});

	test("should invoke hook if element's regular attribute is changed", () => {
		let isElementUpdated = false;

		const e = data('');

		const template = html`
			<button class=${e} :updated=${() => (isElementUpdated = true)}>
				Updated
			</button>
		`;

		template.build<DocumentFragment>();

		e('new value');

		expect(isElementUpdated).toBe(true);
	});

	test("should invoke hook if element's boolean attribute is changed", () => {
		let isElementUpdated = false;

		const e = data(false);

		const template = html`
			<span ?disabled=${e} :updated=${() => (isElementUpdated = true)}>
				Updated
			</span>
		`;

		template.build<DocumentFragment>();

		e(true);

		expect(isElementUpdated).toBe(true);
	});

	test("should invoke hook if element's property is changed", () => {
		let isElementUpdated = false;

		const e = data('');

		const template = html`
			<div .hidden="${e}" :updated=${() => (isElementUpdated = true)}>
				Updated
			</div>
		`;

		template.build<DocumentFragment>();

		e('secret');

		expect(isElementUpdated).toBe(true);
	});

	test('should invoke hook if element is removed from DOM', () => {
		let isElementRemoved = false;

		const e = data(false);

		const template = html`
			<p>
				${() =>
					e()
						? html`<span></span>`
						: html`<p :will-unmount=${() => (isElementRemoved = true)}></p>`}
			</p>
		`;

		template.build<DocumentFragment>();

		e(true);

		expect(isElementRemoved).toBe(true);
	});

	test("hook's first parameter should be an element", () => {
		let element: HTMLParagraphElement | null = null;

		const e = data(false);

		const template = html`<p
			?h="${e}"
			:updated=${(p: HTMLParagraphElement) => (element = p)}
		></p>`;

		template.build<DocumentFragment>();

		e(true);

		expect(element).toBeInstanceOf(HTMLParagraphElement);
	});

	test('should concat class names', () => {
		const e = data('bar');

		const template = html` <p class="foo ${e}"></p> `;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('class'),
		).toMatch(/^foo bar$/);

		e('baz');

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('class'),
		).toMatch(/^foo baz$/);
	});

	test("should not add leading and trailing spaces to attribute's value", () => {
		const e = data('text');

		const template = html` <input type="${e}" /> `;

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('type'),
		).toMatch(/^text$/);

		e('email');

		expect(
			template
				.build<DocumentFragment>()
				.firstElementChild?.getAttribute('type'),
		).toMatch(/^email$/);
	});

	test('should insert HTML elements into processing', () => {
		const div = document.createElement('div');
		div.className = 'self-constructed';

		const template = html`<div class="outer">${div}</div>`;
		expect(
			template.build<DocumentFragment>().querySelector('.self-constructed'),
		).toBeDefined();
	});

	test('should insert SVG elements into processing', () => {
		const svg = createSVG();
		const template = html`<div class="svg-wrapper">${svg}</div>`;

		expect(
			template.build<DocumentFragment>().querySelector('svg'),
		).toBeDefined();
	});

	test('should not accept document object', () => {
		const template = html`<div class="parent">${document}</div>`;

		expect(
			template.build<DocumentFragment>().querySelector('.parent')?.children
				.length,
		).toBe(0);
	});

	test('should not accept window object', () => {
		const template = html`<div class="parent">${window}</div>`;

		expect(
			template.build<DocumentFragment>().querySelector('.parent')?.children
				.length,
		).toBe(0);
	});

	it('should accept raw DocumentFragment object as a child', () => {
		const fragment = document.createDocumentFragment();

		const text = 'It is fragment';
		fragment.append(text);

		const template = html`${fragment}`;

		const builtTemplate = template.build<DocumentFragment>();

		expect(builtTemplate.textContent).toContain(text);
	});

	it('should accept HTMLTemplateElement as a child', () => {
		const text = 'It is HTMLTemplateElement';

		const element = document.createElement('template');
		element.innerHTML = text;

		const template = html`${element}`;

		const builtTemplate = template.build<DocumentFragment>();

		expect(builtTemplate.textContent).toContain(text);
	});
});
