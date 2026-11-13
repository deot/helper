import * as Load from '@deot/helper-load';

describe('style.ts', () => {
	const id = 'test';
	const style = `a { font-size: 14px }`;
	const style2 = `a { font-size: 16px }`;

	const el = document.createElement('style');
	el.setAttribute('id', id);

	beforeEach(() => {
		el.textContent = '';
		document.head.appendChild(el);
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';
		Load.style.cache.clear();
	});

	it('style id', async () => {
		Load.style(style, { id });
		expect(document.getElementById(id)!.innerHTML).toBe(style);
	});

	it('style element', async () => {
		Load.style(style, { id: el });
		expect(el.innerHTML).toBe(style);
		expect(Load.style.cache.size).toBe(0);
	});

	it('style alone 1', async () => {
		Load.style(style, { id: 'alone' });
		Load.style(style, { id: 'alone' });
		Load.style(style, { id: 'alone' });
		expect(document.getElementById('alone')!.innerHTML).toBe(style);
		expect(document.querySelectorAll('#alone').length).toBe(1);
		expect(Load.style.cache.size).toBe(1);
	});

	it('style alone 2', async () => {
		Load.style(style);
		Load.style(style);
		Load.style(style);

		const els = document.querySelectorAll('style:not([id])');
		expect(els.length).toBe(1);
		expect(els[0].innerHTML).toBe(style);
		expect(Load.style.cache.size).toBe(1);
	});

	it('style update, clean stale cache', async () => {
		Load.style(style, { id: 'alone' });
		Load.style(style2, { id: 'alone' });
		expect(document.getElementById('alone')!.innerHTML).toBe(style2);
		expect(Load.style.cache.has(style)).toBe(false);

		// 旧内容可再次按 code 注入
		Load.style(style);
		expect(document.querySelectorAll('style:not([id])').length).toBe(1);
	});

	it('style id, re-create after removed', async () => {
		Load.style(style, { id: 'alone' });
		Load.style(style2, { id: 'alone' });
		Load.removeStyle('alone');
		expect(document.getElementById('alone')).toBe(null);

		Load.style(style, { id: 'alone' });
		expect(document.getElementById('alone')!.innerHTML).toBe(style);
	});

	it('style id, ignore code cache', async () => {
		Load.style(style);
		Load.style(style, { id: 'alone' });
		expect(document.getElementById('alone')!.innerHTML).toBe(style);
	});

	it('removeStyle id', async () => {
		Load.removeStyle(id);
		expect(document.querySelector(`#${id}`)).toBe(null);
	});

	it('removeStyle element', async () => {
		Load.removeStyle(el);
		expect(document.querySelector(`#${id}`)).toBe(null);
	});

	it('removeStyle, clean cache', async () => {
		Load.style(style, { id: 'alone' });
		expect(Load.style.cache.size).toBe(1);

		Load.removeStyle('alone');
		expect(Load.style.cache.size).toBe(0);
	});

	it('removeStyle, outside head', async () => {
		const inBody = document.createElement('style');
		document.body.appendChild(inBody);
		Load.removeStyle(inBody);
		expect(inBody.isConnected).toBe(false);

		// 已脱离文档的元素不应抛错
		Load.removeStyle(inBody);
		Load.removeStyle(document.createElement('style'));
	});

	it('removeStyle empty coverage', async () => {
		Load.removeStyle('');
		Load.removeStyle('alone');
	});
});
