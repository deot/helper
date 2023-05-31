import { dataURLToFile } from './dataURL-to-file';

export const canvasToImage = (canvas: HTMLCanvasElement, filename?: string) => {
	// As base64
	const dataURL = canvas.toDataURL("image/png");
	// As a blob 移动端不兼容
	return new Promise((resolve) => {
		let file: any;

		filename && (file = dataURLToFile(dataURL, filename));

		resolve({ dataURL, file });
	});
};