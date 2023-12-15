import * as Device from '@deot/helper-device';

// @vitest-environment node
describe('environment node', () => {
	it('basic', async () => {
		expect(typeof Device).toBe('object');
	});
});
