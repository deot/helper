import { Wheel } from '@deot/helper-wheel';
import type { WheelOptions } from '@deot/helper-wheel';

// @vitest-environment node
describe('environment node', () => {
	it('wheel', () => {
		const wheel = new Wheel({} as HTMLElement, {} as WheelOptions);
		expect(typeof wheel.on(() => {})).toBe('function');
	});
});
