import { instance } from './instance';

export const regexp = (v?: any): v is RegExp => instance(v, 'RegExp');
