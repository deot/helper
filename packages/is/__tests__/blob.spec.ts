import * as Is from '@deot/helper-is';

describe('blob.ts', () => {
	const blob = new Blob();
	const file = new File([], 'a.js');

	it('Basic', () => {
		expect(Is.blob()).toBe(false);
		expect(Is.blob(blob)).toBe(true);
		expect(Is.blob({})).toBe(false);
		expect(Is.blob('blob')).toBe(false);
	});

	it('File 也是 Blob', () => {
		expect(file instanceof Blob).toBe(true);
		expect(Is.blob(file)).toBe(true);
	});
});
