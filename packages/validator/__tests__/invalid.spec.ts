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
});
