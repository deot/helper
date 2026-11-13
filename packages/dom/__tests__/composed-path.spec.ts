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

	it('includes the target after dispatch has finished', () => {
		const button = el.querySelector('button')!;
		let event!: Event;
		let path: EventTarget[] = [];
		const off = $.on(button, 'click', (e) => {
			event = e;
			path = $.composedPath(e);
		});
		button.click();
		off();

		// 派发结束后原生 composedPath() 返回空数组，走兜底
		expect(event.composedPath()).toEqual([]);
		expect(path.slice(0, 5)).toEqual([button, el, document.body, document.documentElement, document]);
		expect($.composedPath(event)).toEqual([button, el, document.body, document.documentElement, document]);
	});
});
