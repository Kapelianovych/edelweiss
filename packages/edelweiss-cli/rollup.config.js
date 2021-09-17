import base from '../../rollup.config';

export default {
	...base,
	external: [
		'fs',
		'ora',
		'util',
		'path',
		'chalk',
		'commander',
		'@fluss/core',
		'child_process',
	],
};
