import { instance } from './instance';

export const params = (v?: any): v is URLSearchParams => instance(v, 'URLSearchParams');
