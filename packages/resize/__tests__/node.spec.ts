import { Resize } from '@deot/helper-resize';

// @vitest-environment node
describe('environment node', () => {
	it('resize', () => {
		const off = Resize.on({} as HTMLElement, () => {});
		expect(typeof off).toBe('function');
		off();
		expect(Resize.off({} as HTMLElement, () => {})).toBe(undefined);
	});

	it('resize shared', () => {
		const el = {} as HTMLElement;
		const off = Resize.on(el, () => {}, { shared: true });
		expect(typeof off).toBe('function');
		off();
		expect(Resize.off(el, () => {}, { shared: true })).toBe(undefined);
	});
});
