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
});
