import { Validator, RuleHelper } from '@deot/helper-validator';

describe('validator.ts', () => {
	it('required array', async () => {
		expect.hasAssertions();
		const message = 'age is required';
		const validator = new Validator({
			age: {
				required: true,
				message
			},
		});
		try {
			await validator.validate({ age: [null, null] });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('array object & first', async () => {
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
			await validator.validate({ users: [{ age: '' }, { age: null }] }, { first: true });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('array object', async () => {
		expect.assertions(5);
		const message = 'age is required';
		const validator = new Validator({
			users: {
				fields: {
					age: {
						message,
						validate(value, e) {
							value === '' 
								? expect(e.paths).toEqual(['users', 0, 'age'])
								: expect(e.paths).toEqual(['users', 1, 'age']);
							return value 
								? Promise.resolve() 
								: Promise.reject(new Error(`${+e.paths[1] + 1}. age is required`));
						}
					}
				}	
			},
		});
		try {
			await validator.validate({ users: [{ age: '' }, { age: null }] });
		} catch (e: any) {
			expect(e.length).toBe(2);
			expect(e[0].message).toBe(`1. ${message}`);
			expect(e[1].message).toBe(`2. ${message}`);
		}
	});

	it('array object, depth 2', async () => {
		expect.assertions(3);
		const message = 'age is required';
		const validator = new Validator({
			users: {
				fields: {
					better: {
						fields: {
							age: {
								message,
								required: true
							}
						}
					}
				}	
			},
		});
		try {
			await validator.validate({ users: [{ better: [{ age: '' }, { age: null }] }] });
		} catch (e: any) {
			expect(e.length).toBe(2);
			expect(e[0].paths).toEqual(['users', 0, 'better', 0, 'age']);
			expect(e[1].paths).toEqual(['users', 0, 'better', 1, 'age']);
		}
	});

	it('array object, failed', async () => {
		expect.assertions(3);
		const message = 'age is required';
		const validator = new Validator({
			users: {
				required: true,
				message,
				fields: {
					age: {
						message,
						required: true,
					}
				}	
			},
		});
		try {
			await validator.validate({ users: ['', null] });
		} catch (e: any) {
			expect(e[0].paths).toEqual(['users']);
			expect(e.length).toBe(1);
			expect(e[0].message).toBe(message);
		}
	});

	it('array, range: [undefined, 10]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'array', 
				required: true,
				range: [undefined, 10]
			}),
		});
		try {
			await validator.validate({ age: [1] });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('array, range: [0, undefined]', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'array', 
				required: true,
				range: [0, undefined]
			}),
		});
		try {
			await validator.validate({ age: [1] });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('array, range: [0, 10], required: false', async () => {
		expect.assertions(0);
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'array', 
				required: false,
				range: [0, 10]
			})
		});
		try {
			await validator.validate({ age: [1] });
		} catch (e: any) {
			expect(1).toBe(1);
		}
	});

	it('array, type error', async () => {
		expect.hasAssertions();
		const validator = new Validator({
			age: RuleHelper.create({ 
				type: 'array'
			})
		});
		try {
			await validator.validate({ age: {} });
		} catch (e: any) {
			expect(e.length).toBe(1);
			expect(e[0].message).toMatch('类型错误');
		}
	});
});
