import { instance } from './instance';

export const formData = (v?: any) => instance(v, 'FormData');
