import { Validator, RuleHelper } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('number, empty string ', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: RuleHelper.create({ type: 'number', required: true }),
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(e.length).toBe(3);
			expect(e[0].message).toMatch('必填');
			expect(e[1].message).toMatch('请输入正确');
			expect(e[2].message).toMatch('类型错误');
		}
	});

	it('number, empty string, required: false', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ type: 'number' }),
		});
		try {
			await validator.validate({ age: '' });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('number, string number', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: RuleHelper.create({ type: 'number', required: true }),
		});
		try {
			await validator.validate({ age: '0' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('类型错误');
		}
	});

	it('number, number', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ type: 'number', required: true }),
		});
		try {
			await validator.validate({ age: 0 });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('number, range: [0, 10]', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: RuleHelper.create({
				type: 'number',
				required: true,
				range: [0, 10]
			}),
		});
		try {
			await validator.validate({ age: 11 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('范围');
		}
	});

	it('number, range: [undefined, 10]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({
				type: 'number',
				required: true,
				range: [undefined, 10]
			}),
		});
		try {
			await validator.validate({ age: -1 });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('number, range: [0, undefined]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({
				type: 'number',
				required: true,
				range: [0, undefined]
			}),
		});
		try {
			await validator.validate({ age: 99999 });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('number, range: [0, 10], required: false', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({
				type: 'number',
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
});
