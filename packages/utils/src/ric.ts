export type RIC = (handler: IdleRequestCallback, options?: IdleRequestOptions) => any;
export type CIC = (id: number) => void;

export const rIC: RIC = (typeof window !== 'undefined' && window.requestIdleCallback)
	|| ((handler: IdleRequestCallback) => {
		const start = Date.now();
		const cb = () => {
			return handler({
				didTimeout: false,
				timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
			});
		};
		return setTimeout(cb, 1);
	});
export const cIC: CIC = (typeof window !== 'undefined' && window.cancelIdleCallback) || ((id: any) => clearTimeout(id));

// @deprecated
export const ric = rIC;
// @deprecated
export const cic = cIC;
