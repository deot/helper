import { Validator, RuleHelper } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('required', async () => {
		expect.assertions(2);
		const validator = new Validator({
			age: true,
		});
		try {
			await validator.validate({ age: null });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].field).toBe('age');
		}
	});

	it('required message, empty string', async () => {
		expect.assertions(2);
		const message = 'age is required';
		const validator = new Validator({
			age: RuleHelper.required(message),
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});
});
