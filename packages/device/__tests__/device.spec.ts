import { Device } from '@deot/helper-device';

describe('device.ts', () => {
	it('basic', () => {
		expect(typeof Device).toBe('object');
		expect(Device.android).toBe(false);
		expect(Device.ipad).toBe(false);
		expect(Device.ipod).toBe(false);
		expect(Device.iphone).toBe(false);
		expect(Device.androidChrome).toBe(false);
		expect(Device.ios).toBe(false);
		expect(Device.os).toBe('');
		expect(Device.osVersion).toBe('');
		expect(Device.webView).toBe(false);
		expect(Device.wechat).toBe(false);
		expect(Device.wechatVersion).toBe('');
		expect(Device.wechatDevTools).toBe(false);
		expect(Device.touch).toBe(true);
		expect(Device.firefox).toBe(false);
	});

	it('iphone', () => {
		// eslint-disable-next-line max-len
		const d = Device.parse(`Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`);

		expect(d.ipad).toBe(false);
		expect(d.ipod).toBe(false);
		expect(d.iphone).toBe(true);
		expect(d.touch).toBe(true);
		expect(d.ios).toBe(true);
	});

	it('android', () => {
		// eslint-disable-next-line max-len
		const d = Device.parse(`Mozilla/5.0 (Linux; Android 9.0; SAMSUNG SM-F900U Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36`);

		expect(d.iphone).toBe(false);
		expect(d.android).toBe(true);
	});

	it('ipad', () => {
		// eslint-disable-next-line max-len
		const d = Device.parse(`Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1`);

		expect(d.ipad).toBe(true);
		expect(d.iphone).toBe(false);
		expect(d.ios).toBe(true);
	});

	it('ipod', () => {
		// eslint-disable-next-line max-len
		const d = Device.parse(`Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5`);

		expect(d.ipod).toBe(true);
		expect(d.iphone).toBe(false);
		expect(d.ios).toBe(true);
	});
});
