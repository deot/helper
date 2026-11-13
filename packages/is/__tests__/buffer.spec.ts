import * as Is from '@deot/helper-is';

describe('buffer.ts', () => {
	const arrayBuffer = new ArrayBuffer(12);
	const buffer = Buffer.from('2');

	it('Basic', () => {
		expect(Is.buffer()).toBe(false);
		expect(Is.buffer(null)).toBe(false);
		expect(Is.buffer(arrayBuffer)).toBe(false);
		expect(Is.buffer(new Uint8Array(1))).toBe(false);
		expect(Is.buffer(buffer)).toBe(true);
	});

	it('constructor.isBuffer 不是函数时不抛错', () => {
		expect(Is.buffer({ constructor: { isBuffer: true } })).toBe(false);
		expect(Is.buffer({ constructor: null })).toBe(false);
		expect(Is.buffer(Object.create(null))).toBe(false);
	});

	it('始终返回布尔值', () => {
		expect(Is.buffer({ constructor: { isBuffer: () => 1 } })).toBe(true);
		expect(Is.buffer({ constructor: { isBuffer: () => 0 } })).toBe(false);
	});
});
