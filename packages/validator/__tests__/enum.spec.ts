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

	it('enum & required', async () => {
		const message = 'xxx';
		const validator = new Validator({
			name: {
				required: true,
				enum: ['', 1, 2],
				message
			},
		});

		await expect(validator.validate({ name: 3 })).rejects.toMatchObject([{ message, value: 3 }]);
		await expect(validator.validate({ name: '' })).rejects.toMatchObject([{ message, value: '' }]);
		await expect(validator.validate({ name: 1 })).resolves.toBeUndefined();
	});
});
