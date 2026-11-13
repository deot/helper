import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('pattern string', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: '16'
		});
		try {
			await validator.validate({ age: 'aa' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].field).toBe('age');
		}
	});

	it('pattern regex', async () => {
		expect.hasAssertions();
		const message = '年龄必须是数字';
		const validator = new Validator({
			age: {
				message,
				pattern: /\d+/
			}
		});
		try {
			await validator.validate({ age: 'aa' });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('pattern with g / y flag', async () => {
		const pattern = /^\d+$/g;
		const validator = new Validator({
			age: pattern
		});

		// 带g时，test会记录lastIndex，连续验证结果不应变化
		await expect(validator.validate({ age: '123' })).resolves.toBeUndefined();
		await expect(validator.validate({ age: '123' })).resolves.toBeUndefined();
		await expect(validator.validate({ age: 'aa' })).rejects.toHaveLength(1);
		expect(pattern.lastIndex).toBe(0);

		const validator2 = new Validator({
			age: /^\d+$/y
		});
		await expect(validator2.validate({ age: '123' })).resolves.toBeUndefined();
		await expect(validator2.validate({ age: '123' })).resolves.toBeUndefined();
	});

	it('pattern, null / undefined', async () => {
		const validator = new Validator({
			age: /^[a-z]+$/
		});

		// 不应匹配到字符串的'null' / 'undefined'
		await expect(validator.validate({ age: null })).rejects.toHaveLength(1);
		await expect(validator.validate({})).rejects.toHaveLength(1);
		await expect(validator.validate({ age: 'null' })).resolves.toBeUndefined();
	});

	it('pattern & required', async () => {
		const message = '年龄必填';
		const validator = new Validator({
			age: {
				message,
				required: true,
				pattern: /^\d*$/
			}
		});

		await expect(validator.validate({ age: '' })).rejects.toMatchObject([{ message, value: '' }]);
		await expect(validator.validate({ age: null })).rejects.toMatchObject([{ message, value: null }]);
		await expect(validator.validate({ age: 'aa' })).rejects.toMatchObject([{ message, value: 'aa' }]);
		await expect(validator.validate({ age: '16' })).resolves.toBeUndefined();
	});
});
