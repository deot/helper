import * as $ from '@deot/helper-dom';

describe('scroll-into-view.ts', () => {
	const el = document.createElement('div');
	const child = document.createElement('div');
	el.style.overflow = 'scroll';
	child.innerHTML = '<p>xxxx</p>';

	el.appendChild(child);
	document.body.appendChild(el);

	window.scrollTo = () => {};
	window.requestAnimationFrame = (fn: Function) => fn();
	it('basic', async () => {
		$.scrollIntoView(child);
		await $.scrollIntoView(
			child,
			{
				from: 0,
				to: 100
			}
		);

		await $.scrollIntoView(
			window,
			{
				from: 0,
				to: 100
			}
		);

		await $.scrollIntoView(
			window,
			{
				from: 100,
				to: 0
			}
		);
	});
});
