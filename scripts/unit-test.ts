import { Utils, Shell, Logger } from './shared';
import { getOptions } from './unit-test/prompt';

Utils.autoCatch(async () => {
	let args = process.argv;
	let options: any = {};
	const packageNameIndex = args.findIndex(i => i === '--packageName');
	if (packageNameIndex !== -1) {
		options.packageName = args[packageNameIndex + 1] || '**';
	} else {
		options = await getOptions();
	}
	
	const { packageName, watch } = options;

	const command = `cross-env NODE_ENV=${process.env.NODE_ENV || 'TEST'} TEST_OPTIONS=${encodeURIComponent(JSON.stringify(options))} jest ` 
		+ ([
			'--passWithNoTests',
			`${watch ? '--watchAll' : ''}`
		].join(' '));

	await Shell.spawn(command);

	if (!watch) return;

	Logger.log(packageName || '', '测试已通过');
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('测试未通过');
		} else {
			Logger.error(e);
		}
	}
});