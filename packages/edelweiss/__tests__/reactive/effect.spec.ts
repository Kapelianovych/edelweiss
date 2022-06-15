import { spy } from 'internal';
import { suite } from 'uvu';
import { is, not, type, equal } from 'uvu/assert';

import { effect, data, untrack, cleanup } from '../../src/mod.js';

const Effect = suite('effect');

Effect('should be a function', () => {
	type(effect, 'function');
});

Effect('should not return a value', () => {
	not(effect(() => {}));
});

Effect('should execute the function argument', () => {
	const fn = spy();

	effect(fn);

	is(fn.calls.length, 1);
});

Effect('should allow deep nested effects', () => {
	const container = data(0);
	const inner3 = spy(() => container());
	const inner2 = spy(() => effect(inner3));
	const inner1 = spy(() => effect(inner2));
	const outer = spy(() => effect(inner1));

	effect(outer);

	container(1);
	container(2);

	is(outer.calls.length, 1);
	is(inner1.calls.length, 1);
	is(inner2.calls.length, 1);
	is(inner3.calls.length, 3);
	equal(outer.calls[0], { args: [], return: undefined });
	equal(inner1.calls[0], { args: [], return: undefined });
	equal(inner2.calls[0], { args: [], return: undefined });
	equal(inner3.calls[0], { args: [], return: 0 });
	equal(inner3.calls[1], { args: [], return: 1 });
	equal(inner3.calls[2], { args: [], return: 2 });
});

Effect(
	'should not set register nested effect as a child in running state',
	() => {
		const toggle = data(false);
		const container = data(0);

		const first = spy(() => {
			toggle();
			container(untrack(() => container() + 1));
		});
		const second = spy(() => container());

		effect(first);
		effect(second);

		toggle(true);
		toggle(false);
		toggle(true);
		toggle(false);

		is(first.calls.length, 5);
		is(second.calls.length, 5);
	},
);

Effect('should dispose the inner effect after update', () => {
	const toggle = data(true);
	const container = data(0);

	const fn = spy(() => container());

	effect(() => {
		if (toggle()) {
			effect(fn);
		}
	});

	container(2);
	toggle(false);
	container(1);

	is(fn.calls.length, 2);
	equal(fn.calls[1], {
		args: [],
		return: 2,
	});
});

Effect('should execute cleanup functions of inner effects', () => {
	const container = data(0);
	const fn1 = spy();
	const fn2 = spy();
	const fn3 = spy();

	effect(() => {
		container();

		effect(() => {
			cleanup(fn1);
			effect(() => {
				cleanup(fn2);
				effect(() => cleanup(fn3));
			});
		});
	});

	container(1);

	is(fn1.calls.length, 1);
	is(fn2.calls.length, 1);
	is(fn3.calls.length, 1);
});

Effect.run();
