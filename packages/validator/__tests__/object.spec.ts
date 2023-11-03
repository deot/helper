import { Validator, RuleHelper } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('object', async () => {
		expect.hasAssertions();
		const message = 'age is required';
		const validator = new Validator({
			users: {
				fields: {
					age: {
						message,
						required: true,
					}
				}	
			},
		});
		try {
			await validator.validate({ users: { age: '' } });
		} catch (e: any) {
			expect(e[0].paths).toEqual(['users', 'age']);
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('fields failed', async () => {
		expect.hasAssertions();
		const message = 'age is required';
		const validator = new Validator({
			users: {
				validate: () => Promise.reject(message),
				fields: {
					age: {
						message,
						required: false,
					}
				}	
			},
		});
		try {
			await validator.validate({ users: { age: '' } });
		} catch (e: any) {
			expect(e[0].paths).toEqual(['users']);
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('object, type pass', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: RuleHelper.create({ 
				required: true
			})
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('必填');
		}
	});
});
