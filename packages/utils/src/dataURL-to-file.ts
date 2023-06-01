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
) => {
	const hasSuffix = /data:[^;]+;[^,]+,/g.test(dataURL);
	if (!hasSuffix) {
		dataURL = `data:${filetype || getMime(filename)};base64,${dataURL}`;
	}

	let [suffix, dataURL$] = dataURL.split(',');
	let mime = suffix.match(/:(.*?);/)?.[1];
	let bstr = window.atob(dataURL$);
	let n = bstr.length;
	let u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename || '__filename', { type: mime }); // new Blob([u8arr], { type: mime })
};
