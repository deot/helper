import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('first', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: '16',
			age2: '30',
		});
		try {
			await validator.validate({ age: 'aa', age2: 'bb' }, { first: true });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].field).toBe('age');
		}
	});

	it('first, fields', async () => {
		const validator = new Validator({
			users: [
				{
					fields: {
						age: {
							required: true,
							message: 'age is required'
						}
					}
				},
				{
					validate: () => 'users is invalid'
				}
			],
			name: true
		});
		const source = { users: [{ age: '' }, { age: '' }] };

		await expect(validator.validate(source, { first: true })).rejects.toMatchObject([{ paths: ['users', 0, 'age'] }]);
		await expect(validator.validate(source)).rejects.toHaveLength(4);
	});
});
