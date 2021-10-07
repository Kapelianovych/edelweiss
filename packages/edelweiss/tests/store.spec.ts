import './crypto_for_jest';
import { store, createPointer, effect } from '../src';

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

describe('createPointer', () => {
	it('should return function', () => {
		const testStore = store({ h: 0 });

		const hPointer = createPointer(testStore);

		expect(typeof hPointer).toBe('function');
	});

	it('should create getter/setter of value in the store by default', () => {
		const testStore = store({ value: 0 });

		const pointer = createPointer(testStore);
		const state = pointer('value');

		expect(state()).toBe(0);

		state(1);

		expect(testStore.value).toBe(1);
	});

	it('should be able to accept custom getter and setter functions', () => {
		const testStore = store({ value: { a: 0 } });

		const pointer = createPointer(testStore);
		const state = pointer(
			'value',
			({ a }) => a,
			(_, value) => ({ a: value }),
		);

		expect(state()).toBe(0);

		state(1);

		expect(testStore.value).toEqual({ a: 1 });
	});

	it('should create reactive container', () => {
		const testStore = store({ value: { a: 0 } });

		const pointer = createPointer(testStore);
		const state = pointer(
			'value',
			({ a }) => a,
			(_, value) => ({ a: value }),
		);

		let value = 0;
		effect(() => (value = state()));

		state(3);

		expect(value).toBe(3);
	});
});
