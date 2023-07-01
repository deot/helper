const parse = (ua?: string) => {
	ua = ua || (typeof window === 'undefined' ? '' : navigator.userAgent);

	const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);

	const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))/);
	const iphone = !ipod && !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
	const androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
	const ios = !!(iphone || ipad || ipod);

	// Android
	const os = android 
		? 'android' 
		: ios
			? 'ios'
			: '';

	const osVersion = android 
		? android[2]
		: iphone && !ipod
			? iphone[2].replace(/_/g, '.')
			: ipad 
				? ipad[2].replace(/_/g, '.')
				: ipod
					? ipod[3] && ipod[3].replace(/_/g, '.')
					: '';


	// Webview
	const webView = ios && ua.match(/.*AppleWebKit(?!.*Safari)/i);

	// wechat
	const wechat = /MicroMessenger/i.test(ua);
	const wechatVersion = (ua.match(/MicroMessenger\/([\d\.]+)/i) || [])[1] || '';
	const wechatDevTools = /wechatdevtools/.test(ua);

	// touch
	const touch = !!(android || ios || (ua && 'ontouchend' in document));

	// firefox
	const firefox = ua.toLowerCase().indexOf('firefox') > -1;

	return {
		android: !!android,
		ipad: !!ipad,
		ipod: !!ipod,
		iphone: !!iphone,
		androidChrome,
		ios,
		os,
		osVersion,
		webView,
		wechat,
		wechatVersion,
		wechatDevTools,
		touch,
		firefox,
	};
};

export const Device = {
	parse,
	...parse()
};