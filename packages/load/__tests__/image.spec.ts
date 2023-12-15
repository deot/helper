import * as Load from '@deot/helper-load';

describe('image.ts', () => {
	const url = 'https://*.com/helper-load.png';

	Object.defineProperty(globalThis, 'Image', {
		value: class Image {
			src!: any;

			onload!: any;

			onerror!: any;

			constructor() {
				setTimeout(() => {
					this.src && this.src.includes('.png')
						? this.onload && this.onload()
						: this.onerror && this.onerror();
				});
			}
		}
	});

	afterEach(() => {
		Load.image.cache.clear();
	});

	it('empty', async () => {
		expect.assertions(1);
		try {
			await Load.image('');
		} catch {
			expect(Load.image.cache.size).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.image(url);
		await Load.image(url);
		await Load.image(url);
		await Load.image(url);

		expect(Load.image.cache.size).toBe(1);
	});
});
