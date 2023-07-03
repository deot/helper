import * as Load from '@deot/helper-load';

describe('style.ts', () => {
	const id = 'test';
	const style = `a { font-size: 14px }`;

	let el = document.createElement('style');
	el.setAttribute('id', id);

	beforeEach(() => {
		document.getElementsByTagName('head')[0].appendChild(el);
	});

	afterEach(() => {
		document.getElementsByTagName('head')[0].innerHTML = '';
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
		expect(Load.style.cache.size).toBe(1);
	});

	it('style alone 2', async () => {
		Load.style(style);
		Load.style(style);
		Load.style(style);
		expect(document.querySelector('style')!.innerHTML).toBe(style);
	});

	it('removeStyle id', async () => {
		Load.removeStyle(id);
		expect(document.querySelector(`#id`)).toBe(null);
	});

	it('removeStyle element', async () => {
		Load.removeStyle(el);
		expect(document.querySelector(`#id`)).toBe(null);
	});

	it('removeStyle empty coverage', async () => {
		Load.removeStyle('');
		Load.removeStyle('alone');
	});
});