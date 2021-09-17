import './crypto_for_jest';
import { store } from '../src';

describe('store', () => {
	test('on method should return function', () => {
		const testStore = store({ k: '' });

		expect(typeof testStore.on()).toBe('function');
	});

	test('should reactively update value', () => {
		let updated = false;

		const reactive = store({ mark: false });

		reactive.on('mark')((value) => (updated = value));

		expect(updated).toBe(false);

		reactive.mark = true;

		expect(updated).toBe(true);
	});

	test("should return store's value", () => {
		const reactive = store({ mark: false });

		expect(reactive.mark).toBe(false);
	});

	test('should delete attached listener', () => {
		let updated = false;

		const reactive = store({ mark: false });

		const unsubscribe = reactive.on('mark')((value) => (updated = value));
		unsubscribe();

		reactive.mark = true;
		expect(updated).toBe(false);
	});

	it('should update listeners with undefined value when property was deleted', () => {
		let flag = false;

		const reactive = store<{ u?: string }>({ u: 'foo' });

		reactive.on('u')((value) => (flag = Boolean(value)));

		expect(flag).toBe(false);

		reactive.u = 'baz';

		expect(flag).toBe(true);

		delete reactive.u;

		expect(flag).toBe(false);

		reactive.u = 'new';

		expect(flag).toBe(true);
	});

	test('should allow on to two values', () => {
		let count = 0;

		const testStore = store<{ h: number; u: number }>({ h: 0, u: 1 });

		testStore.on('h', 'u')((h, u) => (count += h + u));

		testStore.h = 1;

		expect(count).toBe(2);
	});
});
