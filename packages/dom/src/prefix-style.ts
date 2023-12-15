import { IS_SERVER } from './_constants';

const $target = IS_SERVER ? {} : document.createElement('div').style;
const prefix = (() => {
	const keys = {
		webkit: 'webkitTransform',
		Moz: 'MozTransform',
		O: 'OTransform',
		ms: 'msTransform',
		standard: 'transform'
	};

	const values = {
		webkit: '-webkit-',
		Moz: '-moz-',
		O: '-o-',
		ms: '-ms-',
		standard: ''
	};

	for (const key in keys) {
		if ($target[keys[key]] !== undefined) {
			return {
				camel: key,
				kebab: values[key]
			};
		}
	}

	return false;
})();

export const prefixStyle = (v: string) => {
	if (IS_SERVER || prefix === false) {
		return {
			camel: v,
			kebab: v
		};
	}

	return {
		camel: prefix.camel + v.charAt(0).toUpperCase() + v.substr(1),
		kebab: prefix.kebab + v
	};
};
