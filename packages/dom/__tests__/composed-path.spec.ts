import * as $ from '@deot/helper-dom';

describe('composed-path.ts', () => {
	const el = document.createElement('div');
	el.innerHTML = `<button>~</button>`;

	document.body.appendChild(el);

	it('empty', () => {
		expect($.composedPath(new Event('click'))).toEqual([]);
	});

	it('basic', () => {
		expect.assertions(1);
		document.body.addEventListener('click', (e) => {
			expect($.composedPath(e).length > 0).toBe(true);
		});

		el.click();
	});
});
