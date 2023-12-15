import * as Is from '@deot/helper-is';

describe('files.ts', () => {
	class FileList {
		get [Symbol.toStringTag]() {
			return 'FileList';
		}
	}

	const blob = new Blob();
	const file = new File([], 'a.js');
	const files = new FileList();

	it('Basic', () => {
		expect(Is.files()).toBe(false);
		expect(Is.files(blob)).toBe(false);
		expect(Is.files(file)).toBe(false);
		expect(Is.files(files)).toBe(true);
	});
});
