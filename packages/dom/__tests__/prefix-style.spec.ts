import * as $ from '@deot/helper-dom';

describe('prefix-style.ts', () => {
	it('basic', () => {
		expect($.prefixStyle('transform')).toEqual({
			camel: 'webkitTransform',
			kebab: '-webkit-transform'
		});
	});
});