import { instance } from './instance';

export const file = (v?: any): v is File => instance(v, 'File');
