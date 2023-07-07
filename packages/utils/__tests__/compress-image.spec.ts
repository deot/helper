// eslint-disable-next-line max-classes-per-file
import * as Utils from '@deot/helper-utils';

describe('compress-image.ts', () => {

	let base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
	Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
		value: () => {
			return base64;
		}
	});

	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		value: () => {
			return {
				clearRect() {},
				drawImage() {},
			};
		}
	});

	let file = Utils.dataURLToFile(base64);

	it('success', async () => {
		Object.defineProperty(globalThis, 'Image', {
			value: class Image {
				onload!: any;

				constructor() {
					setTimeout(() => {
						this.onload && this.onload();
					}, 10);
				}
			}
		});
		const result = await Utils.compressImage(file);

		expect(result.dataURL).toBe(base64);
		expect(result.file.name).toBe('__filename');
	});

	it('error', async () => {
		expect.assertions(1);
		let message = new Error();
		Object.defineProperty(globalThis, 'Image', {
			value: class Image {
				onerror!: any;

				constructor() {
					setTimeout(() => {
						this.onerror && this.onerror(message);
					}, 10);
				}
			}
		});
		try {
			await Utils.compressImage(file);
		} catch (e) {
			expect(e).toBe(message);
		}
	});

	it('width / height', async () => {
		Object.defineProperty(globalThis, 'Image', {
			value: class Image {
				onload!: any;

				width: number;

				height: number;

				constructor() {
					this.width = 100;
					this.height = 100;

					setTimeout(() => {
						this.onload && this.onload();
					}, 10);
				}
			}
		});

		// 因为是fake的，所以结果一样
		let result1 = await Utils.compressImage(file, { width: 16, height: 9 });
		let result2 = await Utils.compressImage(file, { width: 9, height: 16 });

		expect(result1.dataURL).toBe(base64);
		expect(result2.file.name).toBe('__filename');
	});
});

