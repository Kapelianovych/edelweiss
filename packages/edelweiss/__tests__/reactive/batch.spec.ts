import { spy } from 'internal';
import { suite } from 'uvu';
import { equal, is, type } from 'uvu/assert';

import { data, effect, batch } from '../../src/mod.js';

const Batch = suite('batch');

Batch('should be a function', () => type(batch, 'function'));

Batch('should immediately execute the parameter', () => {
	const fn = spy();

	batch(fn);

	is(fn.calls.length, 1);
});

Batch('should updata the data only with the last passed value', () => {
	const container = data(0);
	const fn = spy(() => container());

	effect(fn);

	batch(() => {
		container(1);
		container(2);
		container(3);
	});

	is(fn.calls.length, 2);
	equal(fn.calls[0], { args: [], return: 0 });
	is(container(), 3);
	equal(fn.calls[1], { args: [], return: 3 });
});

Batch(
	'should force the datas to return the stale pre-batched value in the parameter even after an update',
	() => {
		const container = data(0);

		batch(() => {
			container(1);

			is(container(), 0);
		});
	},
);

Batch.run();
