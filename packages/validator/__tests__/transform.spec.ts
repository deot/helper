import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('transform', async () => {
		expect.assertions(3);
		const transform = (v: number, e: any) => {
			expect(e.paths).toEqual(['name']);
			return +v;
		};
		const validator = new Validator({
			name: {
				enum: [1, 2, 3],
				transform
			},
		});
		try {
			await validator.validate({ name: '4' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(``);
		}
	});
});
