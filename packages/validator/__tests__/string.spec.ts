import { Validator, RuleHelper } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('string, type', async () => {
		expect.assertions(2);
		const validator = new Validator({
			age: RuleHelper.create({ type: 'string', required: true }),
		});
		try {
			await validator.validate({ age: 0 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('类型错误');
		}
	});

	it('string, range: [undefined, 10]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'string', 
				required: true,
				range: [undefined, 10]
			}),
		});
		try {
			await validator.validate({ age: '-1' });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('string, range: [0, undefined]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'string', 
				required: true,
				range: [0, undefined]
			}),
		});
		try {
			await validator.validate({ age: '99999' });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('string, range: [0, 10], required: false', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'string', 
				required: false,
				range: [0, 10]
			})
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('string, maxlength: 10', async () => {
		expect.assertions(2);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'string', 
				maxlength: 10
			})
		});
		try {
			await validator.validate({ age: 'abcdefgabcd' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('长度不超过');
		}
	});

	it('string, maxlength: 10, type pass', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'string', 
				maxlength: 10
			})
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});
});
