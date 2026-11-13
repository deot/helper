import { instance } from './instance';

export const formData = (v?: any): v is FormData => instance(v, 'FormData');
