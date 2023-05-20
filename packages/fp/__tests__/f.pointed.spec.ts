import * as FP from '@deot/helper-fp';

const { Pointed } = FP;
const R = {
	toUpper: (x: string) => x.toUpperCase(),
	identity: (x: any) => x
};

describe('monad.ts', () => {
	it('map', () => {
		let current = Pointed.of('Hello Pointeds!')
			.map(R.toUpper)
			.map(R.identity);

		expect(current instanceof Pointed).toBe(true);
		expect(current.valueOf()).toBe('HELLO POINTEDS!');
		expect(current.toString()).toBe('Pointed(HELLO POINTEDS!)');
	});
});
