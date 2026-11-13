import { type } from './type';

// 使用 Function 而非函数签名：入参为 any 时不会被收窄，原有的属性访问不受影响
export const fn = (v?: any): v is Function => type(v, 'function');
