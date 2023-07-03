import { Resize } from '@deot/helper-resize';

// @vitest-environment node
describe('environment node', () => {
	it('resize', () => {
		expect(Resize.on({} as HTMLElement, () => {})).toBe(undefined);
		expect(Resize.off({} as HTMLElement, () => {})).toBe(undefined);
	});
});