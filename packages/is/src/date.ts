import { instance } from './instance';

export const date = (v?: any): v is Date => instance(v, 'Date');
