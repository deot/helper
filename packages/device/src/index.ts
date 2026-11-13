export interface DeviceInfo {
	android: boolean;
	harmony: boolean;
	ipad: boolean;
	ipod: boolean;
	iphone: boolean;
	ios: boolean;
	os: 'android' | 'ios' | 'harmony' | '';
	osVersion: string;
	chrome: boolean;
	androidChrome: boolean;
	firefox: boolean;
	webView: boolean;
	wechat: boolean;
	wechatVersion: string;
	wechatDevTools: boolean;
	touch: boolean;
}

const IS_SERVER = typeof window === 'undefined';

const toVersion = (v?: string) => (v || '').replace(/_/g, '.');

const parse = (ua?: string): DeviceInfo => {
	// 未传入 ua 时解析当前环境，仅此时才探测环境能力；传入 ua 时只依据字符串推断
	const useEnv = !ua && !IS_SERVER;
	ua = ua || (useEnv ? navigator.userAgent : '');

	const lower = ua.toLowerCase();
	const maxTouchPoints = useEnv ? (navigator.maxTouchPoints || 0) : 0;

	const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);

	// 鸿蒙 NEXT 的 UA 不含 Android；基于 Android 的旧版鸿蒙仍归为 android
	const harmony = !android && ua.match(/(OpenHarmony)[\s\/]+([\d.]+)?/);

	const ipadUA = ua.match(/(iPad).*OS\s([\d_]+)/);
	// iPadOS 13+ 默认使用桌面版 UA，只能结合触点数识别
	const ipadOS = !ipadUA && useEnv && /Macintosh/.test(ua) && maxTouchPoints > 1;
	const ipad = !!ipadUA || ipadOS;
	const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))/);
	const iphone = !ipod && !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
	const ios = !!(iphone || ipad || ipod);

	const os = android
		? 'android'
		: ios
			? 'ios'
			: harmony
				? 'harmony'
				: '';

	const osVersion = android
		? toVersion(android[2])
		: iphone
			? toVersion(iphone[2])
			: ipadUA
				? toVersion(ipadUA[2])
				: ipod
					? toVersion(ipod[3])
					: harmony
						? toVersion(harmony[2])
						: '';

	const chrome = lower.indexOf('chrome') > -1;
	const firefox = lower.indexOf('firefox') > -1;

	// iOS WebView 的 UA 不带 Safari；Android WebView 带有 `; wv)` 标记
	const webView = ios
		? /AppleWebKit(?!.*Safari)/i.test(ua)
		: !!android && /;\s*wv\)/.test(ua);

	const wechat = /MicroMessenger/i.test(ua);
	const wechatVersion = (ua.match(/MicroMessenger\/([\d\.]+)/i) || [])[1] || '';
	const wechatDevTools = /wechatdevtools/.test(ua);

	const touch = !!(
		android
		|| ios
		|| harmony
		|| (useEnv && (maxTouchPoints > 0 || 'ontouchend' in document))
	);

	return {
		android: !!android,
		harmony: !!harmony,
		ipad,
		ipod: !!ipod,
		iphone: !!iphone,
		ios,
		os,
		osVersion,
		chrome,
		androidChrome: !!android && chrome,
		firefox,
		webView,
		wechat,
		wechatVersion,
		wechatDevTools,
		touch
	};
};

export const Device = {
	parse,
	...parse()
};
