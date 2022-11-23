import util from 'node:util';
import childProcess from 'node:child_process';

const exec = util.promisify(childProcess.exec);
const { log, info } = console;

(async () => {
	const { stdout, stderr } = await exec('lerna link --force-local');
	stdout && log(stdout);
	stderr && info(stderr);
})();