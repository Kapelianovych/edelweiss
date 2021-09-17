import './crypto_for_jest';
import { isTemplate } from '../src/core/template/entity';
import { data, html, render } from '../src';

const createSVG = () =>
	document.createElementNS('http://www.w3.org/2000/svg', 'svg');

describe('isTemplate', () => {
	it('should identify template only', () => {
		expect(isTemplate({})).toBe(false);
		expect(isTemplate([])).toBe(false);
		expect(isTemplate(html``)).toBe(true);
	});
});

describe('html', () => {
	beforeAll(() => (document.body.innerHTML = ''));

	test('html creates DOM nodes', () => {
		const template = html`<p></p>`;

		expect(template.clone().build().childElementCount).toBe(1);
		expect(
			template
				.clone()
				.build()
				.firstElementChild?.isEqualNode(document.createElement('p')),
		).toBe(true);
	});

	it('should not build final DOM while creating template', () => {
		let isChanged = false;

		html`<p :mounted=${() => void (isChanged = !isChanged)}></p>`;

		expect(isChanged).toBe(false);
	});

	test('html inserts template as node into HTML', () => {
		const template = html`<p>${html`yo`}</p>`;

		expect(template.clone().build().firstElementChild?.innerHTML).toMatch('yo');
		expect(
			template.clone().build().firstElementChild?.childNodes.item(0).nodeType,
		).toBe(Node.COMMENT_NODE);
		expect(
			template.clone().build().firstElementChild?.childNodes.item(1).nodeType,
		).toBe(Node.TEXT_NODE);
		expect(
			template.clone().build().firstElementChild?.childNodes.item(2).nodeType,
		).toBe(Node.COMMENT_NODE);
	});

	test('html inserts array of nodes into HTML', () => {
		const template = html`<p>${[html`foo`, 'bar', html`baz`]}</p>`;

		expect(template.clone().build().firstElementChild?.childNodes.length).toBe(
			5 /* 3 Texts + 2 Comments (start and end) */,
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'foo',
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'bar',
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'baz',
		);
	});

	test('html should insert single attribute value', () => {
		const template = html`<p class="${'header'}"></p>`;

		expect(
			template.clone().build().firstElementChild?.getAttribute('class'),
		).toMatch('header');
	});

	test('html should insert attribute value with static parts', () => {
		const template = html`<p class="useful ${'value'}"></p>`;

		expect(
			template.clone().build().firstElementChild?.getAttribute('class'),
		).toMatch('useful value');
	});

	test('html should preserve places for dynamic values in attributes', () => {
		const changing = data('foo');
		const template = html`<p
			class="static ${'dynamic'} ${changing} another"
		></p>`;

		const p = template.clone().build().firstElementChild!;

		expect(p.getAttribute('class')).toBe('static dynamic foo another');

		changing('baz');

		expect(p.getAttribute('class')).toBe('static dynamic baz another');
	});

	test('html should preserve boolean attribute if value is truthy', () => {
		const template = html`<p ?readonly="${true}"></p>`;

		expect(
			template.clone().build().firstElementChild?.hasAttribute('readonly'),
		).toBe(true);
	});

	test('html should remove boolean attribute if value is falsy', () => {
		const template = html`<p ?readonly="${false}"></p>`;

		expect(
			template.clone().build().firstElementChild?.hasAttribute('readonly'),
		).toBe(false);
	});

	test('html should attach event listener to node', () => {
		let clicked = false;

		const template = html`<button @click="${() => (clicked = true)}"></button>`;

		expect(clicked).toBe(false);

		(template.clone().build().firstElementChild as HTMLButtonElement)?.click();

		expect(clicked).toBe(true);
	});

	test('html should set property to node', () => {
		const template = html`<span .title="${'foo'}"></span>`;

		// @ts-ignore
		expect(template.clone().build().firstElementChild?.title).toBe('foo');
	});

	it('should insert null and other values except HTMLTemplateElement as text node', () => {
		const template = html` <span>${null}${undefined}${12345}${true}</span> `;

		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'null',
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'undefined',
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'12345',
		);
		expect(template.clone().build().firstElementChild?.innerHTML).toMatch(
			'true',
		);
	});

	test('should add attribute hook to element', () => {
		const template = html`<div :mounted=${() => {}}></div>`;

		expect(
			template.clone().build().querySelector('[data-es-mounted]'),
		).toBeDefined();
	});

	test('should invoke hook if element is mounted to DOM', () => {
		let isButtonMounted = false;

		const template = html`<button :mounted=${() => (isButtonMounted = true)}>
			Mounted
		</button>`;

		render(document.body, template);

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

		template.clone().build();

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

		template.clone().build();

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

		template.clone().build();

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

		template.clone().build();

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

		template.clone().build();

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

		template.clone().build();

		e(true);

		expect(element).toBeInstanceOf(HTMLParagraphElement);
	});

	test('should concat class names', () => {
		const e = data('bar');

		const template = html` <p class="foo ${e}"></p> `;

		expect(
			template.clone().build().firstElementChild?.getAttribute('class'),
		).toMatch(/^foo bar$/);

		e('baz');

		expect(
			template.clone().build().firstElementChild?.getAttribute('class'),
		).toMatch(/^foo baz$/);
	});

	test("should not add leading and trailing spaces to attribute's value", () => {
		const e = data('text');

		const template = html` <input type="${e}" /> `;

		expect(
			template.clone().build().firstElementChild?.getAttribute('type'),
		).toMatch(/^text$/);

		e('email');

		expect(
			template.clone().build().firstElementChild?.getAttribute('type'),
		).toMatch(/^email$/);
	});

	test('should insert HTML elements into template', () => {
		const div = document.createElement('div');
		div.className = 'self-constructed';

		const template = html`<div class="outer">${div}</div>`;
		expect(
			template.clone().build().querySelector('.self-constructed'),
		).toBeDefined();
	});

	test('should insert SVG elements into template', () => {
		const svg = createSVG();
		const template = html`<div class="svg-wrapper">${svg}</div>`;

		expect(template.clone().build().querySelector('svg')).toBeDefined();
	});

	test('should not accept document object', () => {
		const template = html`<div class="parent">${document}</div>`;

		expect(
			template.clone().build().querySelector('.parent')?.children.length,
		).toBe(0);
	});

	test('should not accept window object', () => {
		const template = html`<div class="parent">${window}</div>`;

		expect(
			template.clone().build().querySelector('.parent')?.children.length,
		).toBe(0);
	});

	it('should accept raw DocumentFragment object as a child', () => {
		const fragment = document.createDocumentFragment();

		const text = 'It is fragment';
		fragment.append(text);

		const template = html`${fragment}`;

		const buildedTemplate = template.clone().build();

		expect(buildedTemplate.textContent).toContain(text);
	});

	it('should accept HTMLTemplateElement as a child', () => {
		const text = 'It is HTMLTemplateElement';

		const element = document.createElement('template');
		element.innerHTML = text;

		const template = html`${element}`;

		const buildedTemplate = template.clone().build();

		expect(buildedTemplate.textContent).toContain(text);
	});

	it('should return same DocumentFragment after building phase', () => {
		const template = html``;

		expect(template.build()).toBe(template.build());
	});

	it('should return Template while cloning template', () => {
		const template = html``;

		expect(isTemplate(template.clone())).toBe(true);
	});

	it('should return different Templates while cloning template', () => {
		const template = html``;

		expect(template.clone()).not.toBe(template.clone());
	});
});
