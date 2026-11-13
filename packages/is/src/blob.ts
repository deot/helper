import { instance } from './instance';

// File 继承自 Blob，但其 toString 标签为 File
export const blob = (v?: any): v is Blob => instance(v, 'Blob') || instance(v, 'File');
