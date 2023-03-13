import * as Utils from '../src';
import type { AnyFunction } from '../src';

describe('index.ts', () => {
	it('dts', () => {
		type DTS = { 
			fn?: AnyFunction;
		};

		const options: DTS = {};
		expect(typeof options).toBe('object');
	});

	it('methods', () => {
		expect(Utils.helper('')).toBe('');
	});
});

