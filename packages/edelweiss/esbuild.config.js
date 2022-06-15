import { build } from 'esbuild';

build({
	entryPoints: ['src/mod.ts'],
	outdir: 'build',
	write: true,
	format: 'esm',
	minify: true,
	target: ['esnext'],
	bundle: true,
	platform: 'neutral',
	sourcemap: true,
});
