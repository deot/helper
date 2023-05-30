import { IS_SERVER } from '@deot/helper-shared';

const ua = navigator.userAgent;

export const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);

export const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
export const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
export const iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
export const androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
export const ios = !!(iphone || ipad || ipod);

// Android
export const os = android 
	? 'android' 
	: ios
		? 'ios'
		: '';

export const osVersion = android 
	? android[2]
	: iphone && !ipod
		? iphone[2].replace(/_/g, '.')
		: ipad 
			? ipad[2].replace(/_/g, '.')
			: ipod
				? ipod[3] && ipod[3].replace(/_/g, '.')
				: '';


// Webview
export const webView = ios && ua.match(/.*AppleWebKit(?!.*Safari)/i);

// wechat
export const wechat = /MicroMessenger/i.test(ua);
export const wechatVersion = (ua.match(/MicroMessenger\/([\d\.]+)/i) || [])[1];
export const wechatDevTools = /wechatdevtools/.test(ua);

// touch
export const touch = !!(android || ios || (!IS_SERVER && 'ontouchend' in document));

// firefox
export const firefox = ua.toLowerCase().indexOf('firefox') > -1;