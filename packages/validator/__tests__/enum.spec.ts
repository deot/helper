import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('enum', async () => {
		expect.hasAssertions();
		const message = 'xxx';
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
			expect(e[0].message).toBe(message);
		}
	});
});
