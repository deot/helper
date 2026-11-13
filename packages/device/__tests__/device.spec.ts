import { Device } from '@deot/helper-device';
import type { DeviceInfo } from '@deot/helper-device';

/* eslint-disable @stylistic/max-len */
const UA = {
	iphone: `Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`,
	iphoneWechat: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42`,
	ipad: `Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1`,
	ipod: `Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5`,
	android: `Mozilla/5.0 (Linux; Android 9.0; SAMSUNG SM-F900U Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36`,
	androidWechat: `Mozilla/5.0 (Linux; Android 14; 23127PN0CC Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160065 MMWEBSDK/20231202 MicroMessenger/8.0.47`,
	androidFirefox: `Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/118.0 Firefox/118.0`,
	androidNoVersion: `Mozilla/5.0 (Linux; Android; K) AppleWebKit/537.36`,
	harmony: `Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile`,
	harmonyLegacy: `Mozilla/5.0 (Linux; Android 12; HarmonyOS; NOH-AN00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36`,
	mac: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`,
	macChrome: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36`
};
/* eslint-enable @stylistic/max-len */

describe('device.ts', () => {
	it('basic', () => {
		expect(typeof Device).toBe('object');
		expect(Device.android).toBe(false);
		expect(Device.harmony).toBe(false);
		expect(Device.ipad).toBe(false);
		expect(Device.ipod).toBe(false);
		expect(Device.iphone).toBe(false);
		expect(Device.chrome).toBe(false);
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

	it('type', () => {
		const d: DeviceInfo = Device.parse(UA.iphone);

		expect(Object.keys(d).sort()).toEqual(Object.keys(Device).filter(i => i !== 'parse').sort());
	});

	it('iphone', () => {
		const d = Device.parse(UA.iphone);

		expect(d.ipad).toBe(false);
		expect(d.ipod).toBe(false);
		expect(d.iphone).toBe(true);
		expect(d.touch).toBe(true);
		expect(d.ios).toBe(true);
		expect(d.os).toBe('ios');
		expect(d.osVersion).toBe('13.2.3');
		expect(d.webView).toBe(false);
		expect(d.wechat).toBe(false);
	});

	it('iphone, wechat', () => {
		const d = Device.parse(UA.iphoneWechat);

		expect(d.iphone).toBe(true);
		expect(d.osVersion).toBe('17.0');
		expect(d.webView).toBe(true);
		expect(d.wechat).toBe(true);
		expect(d.wechatVersion).toBe('8.0.42');
		expect(d.wechatDevTools).toBe(false);
	});

	it('android', () => {
		const d = Device.parse(UA.android);

		expect(d.iphone).toBe(false);
		expect(d.android).toBe(true);
		expect(d.os).toBe('android');
		expect(d.osVersion).toBe('9.0');
		expect(d.chrome).toBe(true);
		expect(d.androidChrome).toBe(true);
		expect(d.webView).toBe(false);
		expect(d.touch).toBe(true);
	});

	it('android, wechat', () => {
		const d = Device.parse(UA.androidWechat);

		expect(d.android).toBe(true);
		expect(d.osVersion).toBe('14');
		expect(d.webView).toBe(true);
		expect(d.wechat).toBe(true);
		expect(d.wechatVersion).toBe('8.0.47');
	});

	it('android, firefox', () => {
		const d = Device.parse(UA.androidFirefox);

		expect(d.android).toBe(true);
		expect(d.osVersion).toBe('13');
		expect(d.firefox).toBe(true);
		expect(d.chrome).toBe(false);
		expect(d.androidChrome).toBe(false);
	});

	it('android, without version', () => {
		const d = Device.parse(UA.androidNoVersion);

		expect(d.android).toBe(true);
		expect(d.osVersion).toBe('');
	});

	it('ipad', () => {
		const d = Device.parse(UA.ipad);

		expect(d.ipad).toBe(true);
		expect(d.iphone).toBe(false);
		expect(d.ios).toBe(true);
		expect(d.osVersion).toBe('13.3');
	});

	it('ipod', () => {
		const d = Device.parse(UA.ipod);

		expect(d.ipod).toBe(true);
		expect(d.iphone).toBe(false);
		expect(d.ios).toBe(true);
		expect(d.osVersion).toBe('4.3.3');
	});

	it('harmony', () => {
		const d = Device.parse(UA.harmony);

		expect(d.harmony).toBe(true);
		expect(d.android).toBe(false);
		expect(d.os).toBe('harmony');
		expect(d.osVersion).toBe('5.0');
		expect(d.chrome).toBe(true);
		expect(d.androidChrome).toBe(false);
		expect(d.touch).toBe(true);
	});

	it('harmony, android based', () => {
		const d = Device.parse(UA.harmonyLegacy);

		expect(d.harmony).toBe(false);
		expect(d.android).toBe(true);
		expect(d.os).toBe('android');
		expect(d.osVersion).toBe('12');
	});

	it('desktop', () => {
		const d = Device.parse(UA.macChrome);

		expect(d.os).toBe('');
		expect(d.osVersion).toBe('');
		expect(d.chrome).toBe(true);
		expect(d.androidChrome).toBe(false);
		expect(d.webView).toBe(false);
	});

	it('explicit ua ignores environment', () => {
		// 当前测试环境支持触控事件，但传入 ua 时只依据字符串推断
		expect(Device.touch).toBe(true);
		expect(Device.parse(UA.mac).touch).toBe(false);
		expect(Device.parse(UA.mac).ipad).toBe(false);
	});

	describe('environment', () => {
		const setTouchPoints = (value?: number) => {
			if (typeof value === 'undefined') {
				delete (navigator as any).maxTouchPoints;
				return;
			}
			Object.defineProperty(navigator, 'maxTouchPoints', { value, configurable: true });
		};

		afterEach(() => {
			vi.restoreAllMocks();
			setTouchPoints();
		});

		it('ipadOS', () => {
			vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(UA.mac);
			setTouchPoints(5);

			const d = Device.parse();
			expect(d.ipad).toBe(true);
			expect(d.iphone).toBe(false);
			expect(d.ios).toBe(true);
			expect(d.os).toBe('ios');
			expect(d.osVersion).toBe('');
			expect(d.touch).toBe(true);
		});

		it('mac', () => {
			vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(UA.mac);
			setTouchPoints(0);

			const d = Device.parse();
			expect(d.ipad).toBe(false);
			expect(d.ios).toBe(false);
			expect(d.os).toBe('');
		});
	});
});
