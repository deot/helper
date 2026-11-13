// 扩展名与 MIME 子类型不一致的情况
const MIME_ALIAS: Record<string, string> = {
	jpg: 'jpeg',
	svg: 'svg+xml'
};

const getMime = (filename?: string) => {
	let ext: any;
	if (typeof filename === 'string' && filename.includes('.')) {
		ext = filename.split('.').pop()!.toLowerCase();
	}

	return ext ? `image/${MIME_ALIAS[ext] || ext}` : 'image/jpeg';
};

const base64ToBytes = (base64: string) => {
	const bstr = atob(base64);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return u8arr;
};

// 非 base64 的 Data URL，内容为百分号编码的文本，如：data:image/svg+xml,%3Csvg...
const textToBytes = (text: string) => {
	try {
		text = decodeURIComponent(text);
	} catch {
		// 含非法 % 时按原文处理
	}

	return new TextEncoder().encode(text);
};

export const dataURLToFile = (
	dataURL: string,
	filename?: string,
	filetype?: string
): File => {
	// 不含前缀时视为纯 base64 内容
	const matched = dataURL.match(/^data:([^,]*),/);
	const [type = '', ...params] = matched ? matched[1].split(';') : [];
	const content = matched ? dataURL.slice(matched[0].length) : dataURL;

	const mime = type || filetype || getMime(filename);
	const u8arr = !matched || params.includes('base64') ? base64ToBytes(content) : textToBytes(content);

	return new File([u8arr], filename || '__filename', { type: mime }); // new Blob([u8arr], { type: mime })
};
