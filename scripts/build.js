const path = require('path');
const fs = require('fs-extra');

const typescript = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');

const { rollup: rollupBuilder } = require('rollup');

class Builder {
	constructor(config) {
		this.config = config;
	}

	async process() {
		let { input, output } = this.config;
		try {
			const builder = await rollupBuilder({
				input,
				external: [
					/^lodash/
				],
				plugins: [
					typescript({
						include: [/\.tsx?$/, /\.vue\?.*?lang(\.|=)ts$/],
					}),
					commonjs({ extensions: ['.js', '.ts'] }),
					nodeResolve(),
					replace({
						 preventAssignment: true
					})
				]
			});
			await builder.write({ output });
			console.log(input + ' Success!');
		} catch (e) {
			console.log('Error!', e);
			throw e;
		}
	}
}

const directory = path.resolve(__dirname, '../packages/');
const files = ['shared', ...fs.readdirSync(directory)]
	.filter((i, index, source) => !['index'].includes(i) && source.indexOf(i) === index);

// 打包顺序调整
[...files, 'index'].reduce((preProcess, file) => {
	const fullpath = path.resolve(directory, file);
	// 获取文件信息
	const stat = fs.statSync(fullpath);
	if (!(/(^_)/.test(file)) && stat.isDirectory()) {
		return preProcess.then(() => {
			const builder = new Builder({
				input: fullpath + '/index.ts',
				output: {
					file: fullpath + '/dist/index.js',
					format: 'es',
					exports: 'named'
				} 
			});
			return builder.process();
		});
	} else {
		return preProcess;
	}
}, Promise.resolve());
