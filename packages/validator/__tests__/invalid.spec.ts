import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('empty', async () => {
		const validator = new Validator();

		await validator.validate({ age: 10 });
	});

	it('empty validator', async () => {
		const validator = new Validator({
			age: [{
				validate: undefined
			}]
		});

		await validator.validate({ age: 10 });
	});

	it('fields without rules', async () => {
		const validator = new Validator({
			age: true
		});

		await expect(validator.validate({}, { fields: ['name'] })).resolves.toBeUndefined();
		await expect(validator.validate({}, { fields: ['constructor', 'toString'] })).resolves.toBeUndefined();
		await expect(validator.validate({}, { fields: ['name', 'age'] })).rejects.toMatchObject([{ field: 'age' }]);
	});

	it('empty source', async () => {
		const validator = new Validator({
			age: true
		});

		await expect(validator.validate(null as any)).rejects.toMatchObject([{ field: 'age', value: undefined }]);
	});

	it('keep rules untouched', async () => {
		const fields = { age: true };
		const rule = { validate: () => true, fields };
		const rule2 = { message: 'xxx' };
		const validator = new Validator({
			user: rule,
			name: rule2
		});

		expect(rule.fields).toBe(fields);
		expect(validator.rules.user[0]).not.toBe(rule);
		expect(validator.rules.user[0].fields).toBeUndefined();
		expect(validator.rules.name[0]).not.toBe(rule2);
		expect(validator.rules.name[0]).toEqual(rule2);
	});
});
