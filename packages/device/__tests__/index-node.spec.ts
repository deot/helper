import * as Device from '@deot/helper-device';

// @vitest-environment node
describe('device.ts', () => {
	it('node', async () => {
		expect(typeof Device).toBe('object');
	});
});