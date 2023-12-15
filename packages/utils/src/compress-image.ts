import { dataURLToFile } from './dataURL-to-file';

export interface CompressImageOptions {
	/**
	 * 图片缩放最大宽度，不传默认源图片宽度
	 */
	width?: number;

	/**
	 * 图片缩放最大高度，不传默认源图片高度
	 */
	height?: number;

	/**
	 * 文件类型
	 */
	filetype?: string;

	/**
	 * 在指定图片格式为 image/jpeg 或 image/webp的情况下
	 * 可以从 0 到 1 的区间内选择图片的质量。
	 * 如果超出取值范围，使用默认值 0.92
	 */
	encoderOptions?: any;
}

export const compressImage = (file: File, options?: CompressImageOptions): Promise<{ dataURL: string; file: File }> => {
	const { width, height, filetype = 'image/jpeg', encoderOptions } = options || {};
	return new Promise((resolve, reject) => {
		// 压缩图片需要的元素和对象
		const el = new Image();
		const reader = new FileReader();
		reader.readAsDataURL(file as File);
		// 文件base64化，以便获知图片原始尺寸
		reader.onload = (e) => {
			el.src = (e.target as any).result as string;
		};
		// 缩放图片需要的canvas
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		// base64地址图片加载完毕后
		el.onload = () => {
			const originWidth = el.width;
			const originHeight = el.height;
			const maxWidth = width || originWidth;
			const maxHeight = height || originHeight;

			let targetWidth = originWidth;
			let targetHeight = originHeight;
			if (originWidth > maxWidth || originHeight > maxHeight) {
				if (originWidth / originHeight > maxWidth / maxHeight) { // 更宽
					targetWidth = maxWidth;
					targetHeight = Math.round(maxWidth * (originHeight / originWidth));
				} else {
					targetHeight = maxHeight;
					targetWidth = Math.round(maxHeight * (originWidth / originHeight));
				}
			}

			// canvas对图片缩放
			canvas.width = targetWidth;
			canvas.height = targetHeight;
			context.clearRect(0, 0, targetWidth, targetHeight);
			context.drawImage(el, 0, 0, targetWidth, targetHeight);
			const dataURL = canvas.toDataURL(filetype, encoderOptions); // 压缩图片
			const compressFile = dataURLToFile(dataURL, file.name);
			resolve({
				dataURL,
				file: compressFile
			});
		};

		el.onerror = (e) => {
			reject(e);
		};
	});
};
