// @vitest-environment node
import { Device } from '@deot/helper-device';

describe('environment node', () => {
	it('basic', () => {
		expect(typeof window).toBe('undefined');
		expect(typeof Device).toBe('object');
		expect(Device.os).toBe('');
		expect(Device.touch).toBe(false);
	});

	it('parse without ua', () => {
		const d = Device.parse();

		expect(d.os).toBe('');
		expect(d.osVersion).toBe('');
		expect(d.touch).toBe(false);
		expect(d.webView).toBe(false);
	});

	it('parse desktop ua', () => {
		// eslint-disable-next-line @stylistic/max-len
		const d = Device.parse(`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36`);

		expect(d.os).toBe('');
		expect(d.ipad).toBe(false);
		expect(d.chrome).toBe(true);
		expect(d.touch).toBe(false);
	});

	it('parse mobile ua', () => {
		// eslint-disable-next-line @stylistic/max-len
		const d = Device.parse(`Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1`);

		expect(d.os).toBe('ios');
		expect(d.osVersion).toBe('17.0');
		expect(d.touch).toBe(true);
	});
});
