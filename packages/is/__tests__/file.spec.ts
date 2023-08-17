import * as Is from '@deot/helper-is';

describe('file.ts', () => {
	const blob = new Blob();
	const file = new File([], 'a.js');

	it('Basic', () => {
		expect(Is.file()).toBe(false);
		expect(Is.file(blob)).toBe(false);
		expect(Is.file(file)).toBe(true);
	});
});

