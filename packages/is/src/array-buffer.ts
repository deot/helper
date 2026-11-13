import { instance } from './instance';

export const arrayBuffer = (v?: any): v is ArrayBuffer => instance(v, 'ArrayBuffer');
