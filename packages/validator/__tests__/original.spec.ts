import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('original', async () => {
		expect.hasAssertions();
		const message1 = 'age > 16 & age < 30';
		const validator = new Validator(
			{
				age: {
					message: message1,
					validate: (value, { original }) => {
						return value < 30 && value > original.min;
					}
				},
			},
			[],
			{
				min: 16
			}
		);

		try {
			await validator.validate({ age: 10 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message1);
		}
	});
});
