/**
 * 任务被主动取消时，等待者收到的错误
 * 可用`isCancelError`或`e.name === 'CancelError'`识别
 */
export class CancelError extends Error {
	constructor(message?: string) {
		super(message || 'Canceled');
		this.name = 'CancelError';
	}
}

// 多份打包产物并存时instanceof会失效，这里同时按name识别
export const isCancelError = (e: any): e is CancelError => {
	return e instanceof CancelError || (!!e && e.name === 'CancelError');
};
