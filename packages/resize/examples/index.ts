import { Resize } from '@deot/helper-resize';

const el = document.createElement('div');

el.style.width = '100vw';
el.style.height = '100vh';
el.style.background = 'yellow';

document.body.appendChild(el);

let count = 0;

const off = Resize.of(el).on(() => {
	el.innerHTML = `Count: ${count++}, 点击取消监听`;
});

setInterval(() => {
	el.style.width = `${Math.ceil(Math.random() * 100)}vw`;
	el.style.height = `${Math.ceil(Math.random() * 100)}vh`;
}, 1000);

el.addEventListener('click', () => {
	el.innerHTML = `Count: ${count}, 强制刷新页面重置`;
	off();
});
