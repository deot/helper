import { Utils, Shell } from './shared';

Utils.autoCatch(async () => {
	await Shell.spawn('cross-env NODE_ENV=development tsx ./scripts/unit-test.ts');
});