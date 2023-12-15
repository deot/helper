import * as Load from '@deot/helper-load';

// @vitest-environment node
describe('environment node', () => {
	it('image', () => {
		expect(Load.image('any')).toBe(undefined);
	});

	it('link', async () => {
		expect(Load.link('any')).toBe(undefined);
	});

	it('script', async () => {
		expect(Load.script('any')).toBe(undefined);
	});

	it('style', async () => {
		expect(Load.style('any')).toBe(undefined);
		expect(Load.removeStyle('any')).toBe(undefined);
	});
});
