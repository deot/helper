import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs-extra';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { rollup as rollupBuilder } from 'rollup';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import chalk from 'chalk';
import ora from 'ora';
import { Utils, Logger } from './shared/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Builder {
	constructor(config) {
		this.packageDir = path.resolve(__dirname, `../packages/${config.name}`);
		this.packageName = config.name === 'index' ? '@deot/helper' : `@deot/helper-${config.name}`;
		this.packageOptions = Utils.require(`${this.packageDir}/package.json`); // eslint-disable-line
		this.config = config;
	}

	async process() {
		const { packageName, packageDir } = this;
		const spinner = ora(`${packageName} Build ...`);
		try {
			spinner.start();
			await fs.emptyDir(`${packageDir}/dist`);

			const stat1 = await this.buildSourceAsES();
			const stat2 = await this.buildSourceAsUMD();
			await this.buildTypes();

			spinner.stop();
			Logger.log(`${chalk.cyan(`${packageName}`)} ${chalk.green('Success')} ES: ${Utils.formatBytes(stat1.size)} UMD: ${Utils.formatBytes(stat2.size)}`); // eslint-disable-line
		} catch (e) {
			Logger.log('Error!', e);
			throw e;
		}
	}

	async buildSourceAsES() {
		const { packageOptions } = this;
		const { name, input, output } = this.config;
		const external = Object
			.keys({ 
				...packageOptions.dependencies, 
				...packageOptions.peerDependencies 
			})
			.map(i => new RegExp(`^${i}$`));

		const builder = await rollupBuilder({
			input,
			external: [
				// /^[a-zA-Z@]/,
				...external
			],
			plugins: [
				typescript({
					include: [`packages/${name}/**/*`, 'packages/shims.d.ts'],
					exclude: ['dist'],
					
					compilerOptions: {
						rootDir: '.', // packages/*/dist/packages/*/src
						outDir: `packages/${name}/dist`,
						declaration: true
					}
				}),
				commonjs({ extensions: ['.js', '.ts'] }),
				nodeResolve(),
				replace({
					preventAssignment: true
				})
			]
		});
		await builder.write(output);
		const stat = await fs.stat(output.file);

		return stat;
	}

	async buildSourceAsUMD() {
		const { packageName } = this;
		const { name, input, output, fullpath } = this.config;
		const builder = await rollupBuilder({
			input,
			external: [],
			plugins: [
				typescript({
					include: [`packages/${name}/**/*`, 'packages/shims.d.ts'],
					exclude: ['dist'],
					compilerOptions: {
						paths: null,
						declaration: false
					}
				}),
				commonjs({ extensions: ['.js', '.ts'] }),
				nodeResolve(),
				replace({
					'process.env.NODE_ENV': `'production'`,
					preventAssignment: true
				})
			]
		});
		const $output = {
			...output,
			file: fullpath + '/dist/index.umd.js',
			format: 'umd',
			name: packageName
		};
		await builder.write($output);
		const stat = await fs.stat($output.file);

		return stat;
	}

	async buildTypes() {
		const { packageDir } = this;

		// build types
		const config = path.resolve(packageDir, `api-extractor.json`);
		const result = Extractor.invoke(
			ExtractorConfig.loadFileAndPrepare(config), 
			{
				localBuild: true,
				showVerboseMessages: false
			}
		);

		if (!result.succeeded) {
			Logger.error(
				`API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
			);
			process.exitCode = 1;
		}

		await fs.remove(`${packageDir}/dist/packages`);
	}
}

Utils.autoCatch(async () => {
	const directory = path.resolve(__dirname, '../packages/');
	const files = ['shared', ...fs.readdirSync(directory)]
		.filter((i, index, source) => !['index'].includes(i) && source.indexOf(i) === index);

	// 打包顺序调整
	await [...files, 'index'].reduce((preProcess, file) => {
		const fullpath = path.resolve(directory, file);
		// 获取文件信息
		const stat = fs.statSync(fullpath);
		if (!(/(^_)/.test(file)) && stat.isDirectory()) {
			return preProcess.then(() => {
				const builder = new Builder({
					fullpath,
					name: file,
					input: fullpath + '/src/index.ts',
					output: {
						file: fullpath + '/dist/index.js',
						format: 'es',
						exports: 'named',
						sourcemap: false
					} 
				});
				return builder.process();
			});
		} else {
			return preProcess;
		}
	}, Promise.resolve());
});
