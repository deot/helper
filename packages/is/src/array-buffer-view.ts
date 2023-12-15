import { arrayBuffer } from './array-buffer';

export const arrayBufferView = (v?: any) => {
	let result: boolean;
	if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
		result = ArrayBuffer.isView(v);
	} else {
		result = (v) && (v.buffer) && (arrayBuffer(v.buffer));
	}
	return result;
};
