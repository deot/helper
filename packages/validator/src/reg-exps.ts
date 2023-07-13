/**
 * @file 一些常用的验证, 正则表达式
 * RegExps.number.test(*)
 * new RegExp(RegExps.number, 'g')
 */

// 如：请输入正确数字
export const number = /^-?\d+(\.\d+)?$/;

// 如：请输入4位短信验证码
export const number4 = /^\d{4}$/;

// 如：请输入6位邮政编码
export const number6 = /^\d{6}$/;

// 如：请输入非负整数
export const integer = /^[1-9]\d*$/;

// 如：邮箱格式不正确
export const email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;

// 如：日期格式不正确
export const date = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;

// 如：时间格式不正确
export const time = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/;

// 身份证格式不正确 - 港澳台比较特
export const identity = /(^[0-9a-zA-Z]{6,}$)/;

// 如：请输入正确金额
export const price = /^([1-9][\d]{0,10}|0)([.]?[\d]{1,2})?$/;

// 如：请填写正确的手机号码
export const mobile = /^(1[3-9])\d{9}$/;

// 如：请填写正确的电话号码
export const tel = /^0[1-9][0-9]{1,2}-[2-8][0-9]{6,7}$/;

// 如：请输入正确的微信号
export const wechat = /^[a-zA-Z\d_-]{5,}$/;

// 如：请不要输入特殊字符
export const name = /^[A-Za-z0-9\u4e00-\u9fa5_-]{1,}$/;

// 如：请输入正确的base64
export const dataURL = /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i;

// 如：请填写正确网页地址协议
export const url = /[a-zA-z]+:\/\/[^\s]*/;