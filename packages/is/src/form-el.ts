import { instance } from './instance';

export const formEl = (v?: any): v is HTMLFormElement => instance(v, 'HTMLFormElement');
