import { spy } from 'internal';
import { suite } from 'uvu';
import { is, type, equal } from 'uvu/assert';

import { data, effect } from '../../src/mod.js';

const Data = suite('data');

Data('should be a function', () => {
	type(data, 'function');
});

Data('should return a function', () => {
	type(data(null), 'function');
});

Data('result should return initial value', () => {
	const container = data(8);

	is(container(), 8);
});

Data('should update an internal value', () => {
	const container = data(0);

	container(1);

	is(container(), 1);
});

Data('should execute an effect on a value update', () => {
	const container = data(0);
	const fn = spy(() => container());

	effect(fn);

	container(1);

	is(fn.calls.length, 2);
	equal(fn.calls[0], { args: [], return: 0 });
	equal(fn.calls[1], { args: [], return: 1 });
});

Data('should execute only direct effect on a value update', () => {
	const container = data(0);
	const inner = spy(() => container());
	const outer = spy(() => effect(inner));

	effect(outer);

	container(1);

	is(outer.calls.length, 1);
	is(inner.calls.length, 2);
	equal(outer.calls[0], { args: [], return: undefined });
	equal(inner.calls[0], { args: [], return: 0 });
	equal(inner.calls[1], { args: [], return: 1 });
});

Data(
	'should not execute an effect if the value to update is strictly equal to the inner one',
	() => {
		const container = data(0);
		const fn = spy(() => container());

		effect(fn);

		container(0);
		container(0);
		container(0);

		is(fn.calls.length, 1);
	},
);

Data(
	'should execute an effect if the value is object type though structurally the same',
	() => {
		const container = data([]);
		const fn = spy(() => container());

		effect(fn);

		container([]);
		container([]);
		container([]);

		is(fn.calls.length, 4);
	},
);

Data.run();
