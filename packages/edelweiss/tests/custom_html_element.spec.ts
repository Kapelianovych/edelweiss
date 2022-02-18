import { html, CustomHTMLElement, Property } from '../src';

describe('CustomHTMLElement', () => {
	test('should define custom web element', () => {
		class MyElement extends CustomHTMLElement {
			template() {
				return html`<button></button>`;
			}
		}

		customElements.define('my-component', MyElement);

		expect(customElements.get('my-component')).toBe(MyElement);
	});

	test('should render button in shadow DOM', () => {
		const myElement = document.createElement('my-component');

		expect(myElement.shadowRoot).toBeDefined();
		expect(myElement.shadowRoot?.innerHTML).toMatch('button');
	});

	test('reactive property should contain null as initial value', () => {
		class MyElement2 extends CustomHTMLElement {
			declare foo: Property;

			static get observedAttributes() {
				return ['foo'];
			}

			template() {
				return html`<div>${this.foo}</div>`;
			}
		}

		customElements.define('my-element2', MyElement2);

		const element = document.createElement('my-element2');

		expect(element.shadowRoot?.innerHTML ?? '').toMatch(
			/^<div>null<\/div>$/,
		);
	});

	test('updating reactive property should update shadow DOM', () => {
		class MyElement3 extends CustomHTMLElement {
			declare foo: Property;

			static get observedAttributes() {
				return ['foo'];
			}

			updateFoo() {
				this.foo = 'bar';
			}

			template() {
				return html`<div>${() => this.foo}</div>`;
			}
		}

		customElements.define('my-element3', MyElement3);

		const element = document.createElement('my-element3') as MyElement3;

		element.updateFoo();

		expect(element.shadowRoot?.innerHTML ?? '').toMatch(
			/^<div>.+bar.+<\/div>$/,
		);
	});
});
