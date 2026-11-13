/**
 * hack event.composedPath
 * touchevent.composedPath 在iOS10.x和iOS9.x上返回的是空数组
 * 事件派发结束后（如异步回调中）原生也会返回空数组
 * 跟默认的相比，少了window对象
 * @param e ~
 * @returns ~
 */
export const composedPath = (e: Event): EventTarget[] => {
	const path = (e.composedPath && e.composedPath()) || [];
	if (path.length) return path;

	// 与原生一致，从 target 自身开始
	let node = e.target as any;
	while (node) {
		path.push(node);
		node = node.parentNode;
	}
	return path;
};
