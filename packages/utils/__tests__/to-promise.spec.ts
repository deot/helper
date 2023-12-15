import * as Utils from '@deot/helper-utils';

describe('to-promise.ts', () => {
	it('instance/then', async () => {
		const target = Utils.toPromise({ a: 1 }, Promise.resolve(2));
		expect(target.a).toBe(1);
		expect(await target).toBe(2);
	});

	it('catch', async () => {
		expect.assertions(1);
		// eslint-disable-next-line prefer-promise-reject-errors
		const target = Utils.toPromise({ a: 1 }, Promise.reject(2));

		await target.catch((e) => {
			expect(e).toBe(2);
		});
	});

	it('finally', async () => {
		expect.assertions(1);
		const target = Utils.toPromise({ a: 1 }, Promise.resolve(2));

		await target.finally(() => {
			expect(1).toBe(1);
		});
	});

	it('TypeError', async () => {
		expect.assertions(1);
		try {
			Utils.toPromise({ then: 1 }, Promise.resolve(2));
		} catch (e: any) {
			expect(e.message).toMatch('TypeError');
		}
	});
});
