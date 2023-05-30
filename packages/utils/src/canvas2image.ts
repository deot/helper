import { base642File } from './base642file';

export const canvas2image = (canvas: HTMLCanvasElement, filename?: string) => {
	// As base64
	const base64 = canvas.toDataURL("image/png");
	// As a blob 移动端不兼容
	return new Promise((resolve) => {
		let file: any;

		filename && (file = base642File(base64, filename));

		resolve({ source: base64, file });
	});
};