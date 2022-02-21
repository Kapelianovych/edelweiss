import { layout } from '../src';

describe('layout', () => {
	it('should return basic html without options parameter', () => {
		expect(typeof layout()).toBe('string');
		expect(layout()).toMatch(/<html>/);
		expect(layout()).toMatch(/<head>/);
		expect(layout()).toMatch(/<body>/);
		expect(layout()).toMatch(/<meta>/);
	});
});
