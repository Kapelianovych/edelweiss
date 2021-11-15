import { lazy, effect } from '../src';

describe('lazy', () => {
	it('should return function', () => {
		expect(typeof lazy(() => Promise.resolve(''), '')).toBe('function');
	});

	it('should return initial value first', () => {
		const a = lazy(() => Promise.resolve('a'), '');

		expect(a()).toBe('');
	});

	it('should reload effect when resource is fetched', (done) => {
		const a = lazy(() => Promise.resolve('a'), '');

		const i = jest.fn(() => a());

		effect(i);

		setTimeout(() => {
			expect(i).toHaveBeenCalledTimes(2);
			done();
		});
	});

	test('that future function can receive a value from the returned function', (done) => {
		const a = lazy((value?: string) => Promise.resolve(value), '');

		a('foo');

		setTimeout(() => {
			expect(a()).toBe('foo');
			done();
		});
	});

	it('should not refetch resource if no dependency was passed to the caller', (done) => {
		const a = lazy((value?: string) => Promise.resolve(value), '');

		a('foo');
		a();

		setTimeout(() => {
			expect(a()).toBe('foo');
			done();
		});
	});

	it('should not cause refetching of a resource if it is already fetched', (done) => {
		const i = jest.fn(() => Promise.resolve('a'));
		const a = lazy(i, '');

		a();

		setTimeout(() => {
			expect(a()).toBe('a');
			expect(i).toHaveBeenCalledTimes(1);
			done();
		});
	});

	test('before getting value it should not loading resources', () => {
		const a = lazy(() => Promise.resolve('a'), '');

		expect(a.loading()).toBe(false);
	});

	it('should signals that resource is loading', () => {
		const a = lazy(() => Promise.resolve('a'), '');

		const i = jest.fn(() => a());

		effect(i);

		expect(a.loading()).toBe(true);
	});

	it('loading function should trigger reexecution of outer effect when resources are loaded', (done) => {
		const a = lazy(() => Promise.resolve('a'), '');

		const i = jest.fn(() => a.loading());

		effect(i);

		a();

		setTimeout(() => {
			expect(i).toHaveBeenCalledTimes(3);
			expect(a.loading()).toBe(false);
			done();
		});
	});

	it('should return undefined if resource does not start loading', () => {
		const a = lazy(() => Promise.resolve('a'), '');

		expect(a.error()).toBe(undefined);
	});

	it('should return error if resource loading fails and cause reexecution of an effect and value id equal to fallback', (done) => {
		const a = lazy(() => Promise.reject(new Error('a')), '');

		const i = jest.fn(() => a.error());

		effect(i);

		a();

		setTimeout(() => {
			expect(i).toHaveBeenCalledTimes(2);
			expect(a.error()).toEqual(new Error('a'));
			expect(a()).toBe('');
			done();
		});
	});
});
