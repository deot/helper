import options from '@deot/dev-extract/jest.config.js';

export default {
	...options,
	moduleNameMapper: {
		'^@deot/helper$': '<rootDir>/packages/index/src',
		'^@deot/helper-(.*?)$': '<rootDir>/packages/$1/src'
	}
};
