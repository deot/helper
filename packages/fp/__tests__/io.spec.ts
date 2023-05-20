import * as FP from '@deot/helper-fp';

const { IO } = FP;
const R = {
	toUpper: (x: string) => x.toUpperCase(),
	addSuffix: (x: string) => x += '!',
	identity: (x: any) => x
};

describe('io.ts', () => {
	it('map', () => {
		let current = IO.of('Hello Pointeds!')
			.map(R.toUpper)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.identity);

		expect(current instanceof IO).toBe(true);
		expect(current.valueOf()).toBe('HELLO POINTEDS!!!!');
	});
});
