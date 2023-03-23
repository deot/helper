import * as os from 'node:os';

export const getHost = () => {
	const ips: string[] = [];
	const ntwk: any = os.networkInterfaces();
	for (const k in ntwk) {
		for (let i = 0; i < ntwk[k].length; i++) {
			const _add = ntwk[k][i].address;
			if (_add && _add.split('.').length == 4 && !ntwk[k][i].internal && ntwk[k][i].family == 'IPv4') {
				ips.push(_add);
			}
		}
	}
	return ips[0];
};

export const formatBytes = (size: number, suffix = 2) => { 
	if (!size) return "0B"; 
	const base = 1024; // 表示要被转化的容量大小，以字节为单
	const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const index = Math.floor(Math.log(size) / Math.log(base)); 

	const value = parseFloat((size / (base ** index)).toFixed(suffix));
	return value + units[index];
};

export const autoCatch = async (impl: any, options: any = {}) => { 
	const { onError = console.error } = options;

	let target = impl;
	typeof target === 'function' && (target = target());

	try {
		const e = await target;
		return e;
	} catch (e) {
		onError(e);
	}
};
