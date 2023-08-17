// eslint-disable-next-line max-classes-per-file
import * as Is from '@deot/helper-is';

class A {}
class B {
	get [Symbol.toStringTag]() {
		return 'any';
	}

	get [Symbol.iterator]() {
		return 'any';
	}
}

describe('plain-object.ts', () => {
	let a = new A();
	let b = new B();
	let c = {
		get [Symbol.toStringTag]() {
			return 'any';
		},
		get [Symbol.iterator]() {
			return 'any';
		}
	};


	it('Basic', () => {
		expect(Is.plainObject()).toBe(false);
		expect(Is.plainObject(null)).toBe(false);
		expect(Is.plainObject({})).toBe(true);

		expect(Is.plainObject(a)).toBe(false);
		expect(Is.plainObject(b)).toBe(false);
		expect(Is.plainObject(c)).toBe(false);
	});
});

