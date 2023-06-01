/**
 * hack event.composedPath
 * touchevent.composedPath 在iOS10.x和iOS9.x上返回的是空数组
 * 跟默认的相比，少了window对象
 * @param {Event} e ~
 * @returns {EventTarget[]} ~
 */
export const composedPath = (e: Event): EventTarget[] => {
	let path = (e.composedPath && e.composedPath()) || [];
	if (path.length) return path;

	let parent = (e.target as any).parentNode;
	while (parent) {
		path.push(parent);
		parent = parent.parentNode;
	}
	return path;
};