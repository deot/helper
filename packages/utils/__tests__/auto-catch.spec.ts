import * as Utils from '@deot/helper-utils';

describe('auto-catch.ts', () => {
	it('basic', async () => {
		const OUTPUT = new Error();
		await Utils.autoCatch(() => {
			return Promise.reject(OUTPUT);
		}, {
			onError: (e: any) => {
				expect(e).toBe(OUTPUT);
			}
		});

		await Utils.autoCatch(() => {
			expect(OUTPUT).toBe(OUTPUT);
		});
	});

	it('sync error', async () => {
		const output = new Error('sync error');
		const onError = vi.fn();

		await expect(Utils.autoCatch(() => {
			throw output;
		}, { onError })).resolves.toBeUndefined();
		expect(onError).toHaveBeenCalledWith(output);
	});
});
