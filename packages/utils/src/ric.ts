export type Ric = (handler: IdleRequestCallback) => any;
export type Cic = (idleId: number) => void;

export const ric: Ric = (typeof window !== 'undefined' && window.requestIdleCallback)
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
export const cic: Cic = (typeof window !== 'undefined' && window.cancelIdleCallback) || ((idleId: any) => clearTimeout(idleId));
