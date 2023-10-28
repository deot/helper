import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('boolean', async () => {
		expect.assertions(2);
		const message1 = 'age < 30';
		const message2 = 'age > 16';
		const validator = new Validator({
			age: [
				{
					message: message1,
					validate: (value) => {
						return value < 30;
					} 
				},
				{
					message: message2,
					validate: (value) => {
						return value > 16;
					} 
				}
			]
		});

		try {
			await validator.validate({ age: 10 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message2);
		}
	});

	it('string', async () => {
		expect.assertions(2);
		const message1 = 'age < 30';
		const message2 = 'age > 16';
		const validator = new Validator({
			age: [
				{
					validate: (value) => {
						return value < 30 || message1;
					} 
				},
				{
					validate: (value) => {
						return value > 16 || message2;
					} 
				}
			]
		});

		try {
			await validator.validate({ age: 10 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message2);
		}
	});

	it('promise', async () => {
		expect.assertions(2);
		const message = 'age > 16';
		const validator = new Validator({
			age: [
				{
					message,
					validate: (value) => {
						return new Promise<void>((resolve, reject) => {
							value > 16 ? resolve() : reject(message);
						});
					} 
				}
			]
		});
		try {
			await validator.validate({ age: 10 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('function', async () => {
		expect.assertions(2);
		const message = 'age > 16';
		const validator = new Validator({
			age: (value) => {
				return new Promise<void>((resolve, reject) => {
					value > 16 ? resolve() : reject(message);
				});
			}
		});
		try {
			await validator.validate({ age: 10 });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});
});
