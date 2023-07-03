import * as Load from '@deot/helper-load';

describe('link.ts', () => {
	let url = 'https://*.com/helper-load.css';

	let originalCreate = document.createElement.bind(document);
	Object.defineProperty(document, 'createElement', {
		value() {
			let target: any = originalCreate('_link_');
			setTimeout(() => {
				target.href && target.href.includes('.css')
					? target.onload && target.onload()
					: target.onerror && target.onerror();
			});

			return target;
		}
	});

	afterEach(() => {
		Load.link.cache.clear();
	});

	it('empty', async () => {
		expect.assertions(1);
		try {
			await Load.link('');
		} catch {
			expect(Load.link.cache.size).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.link(url);
		await Load.link(url);
		await Load.link(url);
		await Load.link(url);
		
		expect(Load.link.cache.size).toBe(1);
	});
});