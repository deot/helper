import options from '@deot/dev-extract/jest.config.js';

export default {
	...options,
	collectCoverage: process.env.NODE_ENV !== 'development',
	moduleNameMapper: {
		'^@deot/helper$': '<rootDir>/packages/index/src',
		'^@deot/helper-(.*?)$': '<rootDir>/packages/$1/src'
	}
};
