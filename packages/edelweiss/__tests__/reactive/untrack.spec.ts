import { spy } from 'internal';
import { suite } from 'uvu';
import { is, type, equal } from 'uvu/assert';

import { data, effect, untrack } from '../../src/mod.js';

const Untrack = suite('untrack');

Untrack('should be a function', () => {
	type(untrack, 'function');
});

Untrack('should execute its parameter and return its result', () => {
	const fn = spy(() => 7);

	const result = untrack(fn);

	is(result, 7);
	is(fn.calls.length, 1);
});

Untrack('should prevent dependency detection', () => {
	const container = data(0);
	const fn = spy(() => untrack(container));

	effect(fn);

	container(1);
	container(2);
	container(3);

	is(fn.calls.length, 1);
	equal(fn.calls[0], { args: [], return: 0 });
});

Untrack.run();
