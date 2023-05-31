import { IS_SERVER } from '@deot/helper-shared';

const $target = IS_SERVER ? {} : document.createElement('div').style;
const prefix = (() => {
	let keys = {
		webkit: 'webkitTransform',
		Moz: 'MozTransform',
		O: 'OTransform',
		ms: 'msTransform',
		standard: 'transform'
	};

	let values = {
		webkit: '-webkit-',
		Moz: '-moz-',
		O: '-o-',
		ms: '-ms-',
		standard: ''
	};

	for (let key in keys) {
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
	if (prefix === false) {
		!IS_SERVER && !prefix && console.log('不支持style fix');
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