import util from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import childProcess from 'node:child_process';
import ora from 'ora';
import fs from 'fs-extra';
import { Prompt } from './add/prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const exec = util.promisify(childProcess.exec);
const { log, info } = console;

(async () => {
	const { mode, dependentName, args, packageName, $packageName } = await new Prompt().run();

	let shell = mode === 'dependent' 
		? `lerna add ${dependentName} ${args.join(' ')} --scope=${$packageName}`
		: `lerna create ${$packageName} --yes`
		
	const spinner = ora(shell);

	spinner.start();
	const { stdout, stderr } = await exec(shell);
	spinner.stop();

	stdout && log(stdout);
	stderr && info(stderr);

	// 包名修改
	if (mode === 'package') {
		let dir = resolve(__dirname, `../packages`);
		fs.renameSync(
			`${dir}/helper-${packageName}`,
			`${dir}/${packageName}`
		);

		// 清理lerna创建的文件
		fs.removeSync(`${dir}/${packageName}/__tests__`);
		fs.removeSync(`${dir}/${packageName}/lib`);

		fs.outputFileSync(`${dir}/${packageName}/README.md`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/index.ts`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/package.json`, JSON.stringify({
			name: $packageName,
			version: '1.0.0',
			main: 'dist/index.js',
			license: 'MIT',
			publishConfig: {
				access: 'public'
			},
			dependencies: {}
		}, null, '\t'));
	}
})();