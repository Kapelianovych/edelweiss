import './crypto_for_jest';
import { translate, languages, translations, language } from '../src';

describe('internationalization', () => {
	test('languages should return empty array if no translation object were added.', () => {
		expect(languages()).toEqual([]);
	});

	test('translations function should add translation object to supported languages.', () => {
		translations({ code: 'en', texts: { key: 'value' } });
		expect(languages()).toEqual(['en']);
	});

	test("language should return browser's preferred language if it was never invoked.", () => {
		expect(language()).toBe(window.navigator.language);
	});

	test('language should change current language', () => {
		language('uk');
		expect(language()).toBe('uk');
	});

	test(
		'translate should return undefined if path parts ' +
			'resolve to not existed translation text',
		() => {
			const dependency = translate('foo.baz');
			expect(dependency()).toBe(undefined);
		},
	);

	test('translate should return text with a valid path parts', () => {
		language('en');
		const dependency = translate<{ key: string }>('key');
		expect(dependency()).toBe('value');
	});

	test('translate should return an object when path parts are too short.', () => {
		translations({ code: 'by', texts: { foo: { bar: { baz: 'odoo' } } } });
		language('by');
		const dependency = translate('foo.bar');
		expect(dependency()).toEqual({ baz: 'odoo' });
	});

	test('translate method should insert variables into text', () => {
		const translation = { code: 'en', texts: { foo: 'bar {baz}' } } as const;
		translations(translation);
		language('en');
		const dependency = translate<typeof translation['texts']>('foo', {
			baz: 'odoo',
		});
		expect(dependency()).toMatch('bar odoo');
	});
});
