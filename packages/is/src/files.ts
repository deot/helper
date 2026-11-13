import { instance } from './instance';

export const files = (v?: any): v is FileList => instance(v, 'FileList');
