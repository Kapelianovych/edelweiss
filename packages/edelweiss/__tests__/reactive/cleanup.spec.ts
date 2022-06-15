import { spy } from 'internal';
import { suite } from 'uvu';
import { is, type } from 'uvu/assert';

import { data, effect, cleanup } from '../../src/mod.js';

const Cleanup = suite('cleanup');

Cleanup('should be a function', () => type(cleanup, 'function'));

Cleanup('should not return any value', () => {
	const fn = spy();

	const result = cleanup(fn);

	is(result, undefined);
});

Cleanup('should not immediately execute the parameter', () => {
	const fn = spy();

	effect(() => cleanup(fn));

	is(fn.calls.length, 0);
});

Cleanup("should be invoked on every effect's update", () => {
	const container = data(0);
	const fn = spy();

	effect(() => {
		container();
		cleanup(fn);
	});

	container(1);
	container(2);
	container(3);

	is(fn.calls.length, 3);
});

Cleanup.run();
