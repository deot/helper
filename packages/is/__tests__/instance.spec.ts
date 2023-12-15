// eslint-disable-next-line max-classes-per-file
import * as Is from '@deot/helper-is';

class A {}
class B {
	get [Symbol.toStringTag]() {
		return 'B';
	}
}

describe('instance.ts', () => {
	const a = new A();
	const b = new B();

	it('Basic', () => {
		expect(Is.instance([], Array)).toBe(true);
		expect(Is.instance(a, Object)).toBe(true);
		expect(Is.instance(b, Object)).toBe(true);
		expect(Is.instance(a, 'Object')).toBe(true);

		expect(Is.instance(b, 'Object')).toBe(false);
		expect(Is.instance(b, 'B')).toBe(true);
	});
});
