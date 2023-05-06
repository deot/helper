import * as Utils from '@deot/helper-utils';

describe('utils.ts', () => {
	it('autoCatch', () => {
		const OUTPUT = new Error();
		Utils.autoCatch(() => {
			return Promise.reject(OUTPUT);
		}, {
			onError: (e: any) => {
				expect(e).toBe(OUTPUT);
			}
		});

		Utils.autoCatch(() => {
			expect(OUTPUT).toBe(OUTPUT);
		});
	});
});

