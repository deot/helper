import { Utils, Shell } from './shared';

Utils.autoCatch(async () => {
	const command = 'lerna link --force-local';
	await Shell.spawn(command);	
});
