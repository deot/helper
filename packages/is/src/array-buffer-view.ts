export const arrayBufferView = (v?: any): v is ArrayBufferView => ArrayBuffer.isView(v);
