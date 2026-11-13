import { Validator } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('boolean', async () => {
		expect.hasAssertions();
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
		expect.hasAssertions();
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
		expect.hasAssertions();
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
		expect.hasAssertions();
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

	it('throw', async () => {
		const message = 'age > 16';
		const validator = new Validator({
			age: (value) => {
				if (value <= 16) throw new Error(message);
			}
		});

		// 同步抛错与reject一致
		await expect(validator.validate({ age: 10 })).rejects.toMatchObject([{ message, field: 'age', value: 10 }]);
		await expect(validator.validate({ age: 18 })).resolves.toBeUndefined();
	});

	it('transform throw', async () => {
		const validator = new Validator({
			age: {
				transform: value => value.trim(),
				validate: () => true
			}
		});

		await expect(validator.validate({ age: 10 })).rejects.toMatchObject([
			{ message: expect.stringContaining('trim'), field: 'age', value: 10 }
		]);
		await expect(validator.validate({ age: ' 10 ' })).resolves.toBeUndefined();
	});

	it('promise, reject without message', async () => {
		const message = 'age > 16';
		const validator = new Validator({
			age: [
				{
					message,
					validate: () => Promise.reject()
				},
				{
					message,
					validate: () => Promise.reject({ code: 1 })
				}
			]
		});

		await expect(validator.validate({ age: 10 })).rejects.toMatchObject([{ message }, { message }]);
	});

	it('promise, resolve false / string', async () => {
		const message1 = 'age < 30';
		const message2 = 'age > 16';
		const validator = new Validator({
			age: [
				{
					message: message1,
					validate: async value => value < 30
				},
				{
					validate: async value => value > 16 || message2
				}
			]
		});

		await expect(validator.validate({ age: 40 })).rejects.toMatchObject([{ message: message1 }]);
		await expect(validator.validate({ age: 10 })).rejects.toMatchObject([{ message: message2 }]);
		await expect(validator.validate({ age: 20 })).resolves.toBeUndefined();
	});

	it('thenable', async () => {
		const message = 'age > 16';
		const validator = new Validator({
			age: (value): any => {
				return {
					then: (resolve: any) => resolve(value > 16 || message)
				};
			}
		});

		await expect(validator.validate({ age: 10 })).rejects.toMatchObject([{ message }]);
		await expect(validator.validate({ age: 20 })).resolves.toBeUndefined();
	});
});
