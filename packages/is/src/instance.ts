export const instance = (v: any, constructor: Function | string) => {
	return typeof constructor === 'function' 
		? v instanceof constructor
		: Object.prototype.toString.call(v) === `[object ${constructor}]`;
};
