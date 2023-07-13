import { Validator } from '@deot/helper-validator';
import type { ValidateError } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('message function', async () => {
		expect.assertions(2);
		const message = (e: ValidateError) => e.paths.join('');
		const validator = new Validator({
			name: {
				enum: [1, 2, 3],
				message
			},
		});
		try {
			await validator.validate({ name: 4 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(`name`);
		}
	});
});
