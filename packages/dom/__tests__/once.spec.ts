import * as $ from '@deot/helper-dom';

describe('once.ts', () => {
	const el = document.createElement('div');
	it('empty', () => {
		expect(typeof $.once(el, 'empty', () => {})).toBe('function');
	});

	it('once', () => {
		expect.assertions(1);
		const off = $.once(el, 'click', (e) => {
			expect(e.type).toBe('click');
		});

		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		off();
	});

	it('unbinds even if the handler throws', () => {
		const target = new EventTarget();
		let count = 0;
		$.once(target, 'boom', () => {
			count++;
			throw new Error('boom');
		});

		// 监听器内的异常由 dispatchEvent 上报为 error 事件，这里拦截掉
		const onError = (e: Event) => e.preventDefault();
		window.addEventListener('error', onError);
		target.dispatchEvent(new Event('boom'));
		target.dispatchEvent(new Event('boom'));
		window.removeEventListener('error', onError);

		expect(count).toBe(1);
	});

	it('does not re-enter when the handler dispatches the same event', () => {
		let count = 0;
		$.once(el, 'again', () => {
			count++;
			el.dispatchEvent(new Event('again'));
		});

		el.dispatchEvent(new Event('again'));
		expect(count).toBe(1);
	});

	it('returns the handler result and keeps this', () => {
		let self: any;
		let listener!: Function;
		const target = {
			addEventListener(_: string, handler: Function) {
				listener = handler;
			},
			removeEventListener() {}
		} as unknown as EventTarget;

		$.once(target, 'any', function (this: any, v: number) {
			self = this;
			return v + 1;
		});
		expect(listener.call(target, 1)).toBe(2);
		expect(self).toBe(target);
	});
});
