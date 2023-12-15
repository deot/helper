const getMime = (filename?: string) => {
	let ext: any;
	if (typeof filename === 'string' && filename.includes('.')) {
		ext = filename.split('.').pop();
	}

	return ext ? `image/${ext}` : 'image/jpeg';
};

export const dataURLToFile = (
	dataURL: string,
	filename?: string,
	filetype?: string
): File => {
	const hasPrefix = /data:[^;]+;[^,]+,/g.test(dataURL);
	if (!hasPrefix) {
		dataURL = `data:${filetype || getMime(filename)};base64,${dataURL}`;
	}

	const [suffix, dataURL$] = dataURL.split(',');
	const mime = suffix.match(/:(.*?);/)?.[1];
	const bstr = window.atob(dataURL$);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename || '__filename', { type: mime }); // new Blob([u8arr], { type: mime })
};
