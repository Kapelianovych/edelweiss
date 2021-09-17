import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

// Base config for packages. Should not be used directly.
export default {
	input: 'src/index.ts',
	output: {
		dir: 'build',
		format: 'es',
		sourcemap: true,
		preserveModules: true,
		preserveModulesRoot: 'src',
	},
	plugins: [typescript(), json(), terser()],
};
