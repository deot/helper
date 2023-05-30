export const base642File = (base64Image: string, filename?: string) => {

	// 处理前缀
	if (!(/data:image\/[^;]+;base64,/g.test(base64Image))) {
		let suffix;
		if (typeof filename === 'string' && filename.includes('.')) {
			suffix = filename.split('.').pop();
		}
		base64Image = `data:image/${suffix || 'jpeg'};base64,${base64Image}`;
	}

	let arr = base64Image.split(',');
	let mime = arr[0].match(/:(.*?);/)?.[1];
	let bstr = atob(arr[1]); // -> Buffer.from(arr[1], 'base64')
	let n = bstr.length;
	let u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	let file = new Blob([u8arr], { type: mime });

	// @ts-ignore
	file.name = filename;
	return file;
};
