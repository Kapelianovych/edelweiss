import base from '../../rollup.config';

export default {
	...base,
	external: ['fs', 'path', '@happy-dom/global-registrator'],
};
