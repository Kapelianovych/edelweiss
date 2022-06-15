import { suite } from 'uvu';
import { equal, is, ok, type } from 'uvu/assert';

import { spy } from '../spy.js';

const Spy = suite('spy');

Spy('should be a function', () => type(spy, 'function'));

Spy('should return a function when no argument is provided', () =>
	type(spy(), 'function'),
);

Spy('should return a function with the calls property', () => {
	const fn = spy();

	ok(fn.calls);
	equal(fn.calls, []);
});

Spy('should memoize arguments and return value of the spied function', () => {
	const fn = spy((value: number) => value * 2);

	fn(7);

	is(fn.calls.length, 1);
	equal(fn.calls, [{ args: [7], return: 14 }]);
});

Spy("should memoize every function's call", () => {
	const fn = spy((value: number) => value * 2);

	fn(2);
	fn(3);
	fn(5);

	is(fn.calls.length, 3);
	equal(fn.calls[0], { args: [2], return: 4 });
	equal(fn.calls[1], { args: [3], return: 6 });
	equal(fn.calls[2], { args: [5], return: 10 });
});

Spy("should preserve the length of parameter's function", () => {
	const fn = spy((value: number) => value * 2);

	is(fn.length, 1);
});

Spy.run();
