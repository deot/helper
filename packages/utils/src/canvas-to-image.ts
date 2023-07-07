import { dataURLToFile } from './dataURL-to-file';

interface Result {
	dataURL: string; 
	file?: File;
}

export const canvasToImage = (canvas: HTMLCanvasElement, filename?: string): Promise<Result> => {
	const dataURL = canvas.toDataURL("image/png"); // base64
	
	return new Promise((resolve) => {
		let result: Result = {
			dataURL
		};

		if (typeof filename === 'string') {
			result.file = dataURLToFile(dataURL, filename);
		}

		resolve(result);
	});
};