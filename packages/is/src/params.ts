import { instance } from './instance';

export const params = (v?: any) => instance(v, 'URLSearchParams');
