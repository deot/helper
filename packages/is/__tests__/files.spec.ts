import * as Is from '@deot/helper-is';

describe('files.ts', () => {
	class FileList {
		get [Symbol.toStringTag]() {
			return 'FileList';
		}
	}

	const blob = new Blob();
	const file = new File([], 'a.js');

	it('Basic', () => {
		const input = document.createElement('input');
		input.type = 'file';

		expect(Is.files()).toBe(false);
		expect(Is.files(blob)).toBe(false);
		expect(Is.files(file)).toBe(false);
		expect(Is.files([file])).toBe(false);
		expect(Is.files(input.files)).toBe(true);
	});

	it('按 toString 标签判断', () => {
		expect(Is.files(new FileList())).toBe(true);
	});
});
