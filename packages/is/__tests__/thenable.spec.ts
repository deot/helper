import * as Is from '@deot/helper-is';

describe('thenable.ts', () => {
	it('Basic', () => {
		expect(Is.thenable()).toBe(false);
		expect(Is.thenable(null)).toBe(false);
		expect(Is.thenable(Promise.resolve())).toBe(true);
		expect(Is.thenable({ then() {} })).toBe(true);
		expect(Is.thenable({})).toBe(false);
		expect(Is.thenable({ then: true })).toBe(false);
	});

	it('函数上挂载 then', () => {
		const fn = () => {};
		expect(Is.thenable(fn)).toBe(false);

		fn.then = () => {};
		expect(Is.thenable(fn)).toBe(true);
	});

	it('原始类型不算', () => {
		const { prototype } = String as any;
		prototype.then = () => {};
		try {
			expect(Is.thenable('')).toBe(false);
		} finally {
			delete prototype.then;
		}
	});
});
