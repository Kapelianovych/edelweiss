import { batch, cleanup, data, effect, untrack } from '../src';

describe('data', () => {
	it('data should return a function', () => {
		const a = data(0);
		expect(typeof a).toBe('function');
	});

	it('function that is returned by data should return initial value', () => {
		const a = data(0);

		expect(a()).toBe(0);
	});

	it('function that is returned by data should update value', () => {
		const a = data(0);

		a(1);

		expect(a()).toBe(1);
	});
});

describe('effect', () => {
	it('should return undefined', () => {
		expect(effect(() => {})).toBe(undefined);
	});

	it('should invoke function if data changes inner value', () => {
		const mockFn = jest.fn();
		const a = data(0);

		effect(mockFn);

		a(1);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('data that is called with the value that is inside should not update effect', () => {
		const mockFn = jest.fn();
		const a = data(0);

		effect(mockFn);

		a(1);
		a(1);
		a(1);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('should not track data value that is in if clause and is not invoked immediately', () => {
		const a = data(0);
		const b = data(0);

		const effectFn = jest.fn(() => {
			if (a() > 0) {
				b();
			}
		});

		effect(effectFn);

		b(5);

		expect(effectFn).toHaveBeenCalledTimes(1);
	});

	it(
		'should track data value that is in if clause and it is invoked immediately, ' +
			'but on next invokation if condition evaluates to false it should stop tracking data value.',
		() => {
			const a = data(0);
			const b = data(0);

			const effectFn = jest.fn(() => {
				if (a() <= 0) {
					b();
				}
			});

			effect(effectFn);

			b(5);
			a(5);
			b(3);

			expect(effectFn).toHaveBeenCalledTimes(3);
		},
	);

	it('data registered inside inner effect should not cause executing of outer effect', () => {
		const a = data(0);
		const b = data(0);

		const o = jest.fn(() => {
			a();
			effect(i);
		});
		const i = jest.fn(() => b());

		effect(o);

		expect(o).toHaveBeenCalled();
		expect(i).toHaveBeenCalled();

		b(2);

		expect(o).toHaveBeenCalledTimes(1);
		expect(i).toHaveBeenCalledTimes(2);
	});

	it('should unregister effect if condition evaluates to false', () => {
		const a = data(0);
		const b = data(0);

		const i = jest.fn(() => b());
		const o = jest.fn(() => {
			if (a() > 0) {
				effect(i);
			}
		});

		effect(o);

		expect(i).not.toHaveBeenCalled();

		a(1);

		expect(i).toHaveBeenCalled();

		a(0);

		expect(i).toHaveBeenCalledTimes(1);

		b(5);
		b(3);
		b(8);

		expect(i).toHaveBeenCalledTimes(1);
	});
});

describe('untrack', () => {
	it('should return value from getter', () => {
		const a = data(0);

		expect(untrack(a)).toBe(0);
	});

	it('should disable tracking data', () => {
		const a = data(0);

		const i = jest.fn(() => untrack(a));

		effect(i);

		expect(i).toHaveBeenCalled();

		a(4);

		expect(i).toHaveBeenCalledTimes(1);
	});
});

describe('cleanup', () => {
	it('should return undefined', () => {
		expect(cleanup(() => {})).toBe(undefined);
	});

	it('should be invoked on every effect invokation', () => {
		const a = data(0);

		const i = jest.fn();

		effect(() => {
			a();
			cleanup(i);
		});

		expect(i).not.toHaveBeenCalled();

		a(5);

		expect(i).toHaveBeenCalled();
	});

	it('should be invoked when effect is disposed', () => {
		const a = data(0);

		const i = jest.fn();

		effect(() => {
			a();
			effect(() => cleanup(i));
		});

		a(1);

		expect(i).toHaveBeenCalled();
	});
});

describe('batch', () => {
	it('should return undefined', () => {
		expect(batch(() => {})).toBe(undefined);
	});

	it('should update only last invokation of data setter', () => {
		const a = data(0);

		const i = jest.fn(() => a());

		effect(i);

		batch(() => {
			a(1);
			a(5);
			a(7);
		});

		expect(i).toHaveBeenCalledTimes(2);
		expect((a as unknown as () => number)()).toBe(7);
	});

	it('should not update data inside batch invokation', () => {
		const a = data(0);

		batch(() => {
			a(1);
			expect(a()).toBe(0);
		});

		expect(a()).toBe(1);
	});
});
