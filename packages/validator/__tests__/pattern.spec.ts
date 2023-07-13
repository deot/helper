import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('pattern string', async () => {
		expect.assertions(2);
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
		expect.assertions(2);
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
});
