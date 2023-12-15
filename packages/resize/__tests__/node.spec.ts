import { Resize } from '@deot/helper-resize';

// @vitest-environment node
describe('environment node', () => {
	it('resize', () => {
		const off = Resize.on({} as HTMLElement, () => {});
		expect(typeof off).toBe('function');
		off();
		expect(Resize.off({} as HTMLElement, () => {})).toBe(undefined);
	});
});
