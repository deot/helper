# @deot/helper-validator

支持同步、异步、正则、必填、枚举、转换和嵌套字段的规则验证器，并附带常用正则与规则创建助手。

## 安装

```bash
pnpm add @deot/helper-validator
```

## 使用

```ts
import { Validator, RegExps, RuleHelper } from '@deot/helper-validator';

const validator = new Validator({
	name: RuleHelper.create({ name: '姓名', required: true, maxlength: 20 }),
	email: {
		pattern: RegExps.email,
		message: '邮箱格式不正确'
	},
	age: [
		true,
		value => value >= 18 || '年龄必须不小于 18'
	]
});

try {
	await validator.validate({ name: 'Deot', email: 'dev@example.com', age: 18 });
} catch (errors) {
	showErrors(errors);
}
```

也可以从聚合包导入 `Validator`、`RegExps` 和 `RuleHelper`。

## API

### Validator

按字段规则验证对象，支持转换、自定义校验、嵌套对象和对象数组。

#### `new Validator(rules?, paths?, original?)`

创建验证器并归一化规则；paths 用作嵌套错误路径前缀

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `rules` / `paths` / `original` | `ValidatorRules` / `(string \| number)[]` / `any` | `{}` / `[]` / — | `Validator` |

#### `Validator.updateRules(rules?)`

归一化并追加或替换指定字段规则

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `rules` | `ValidatorRules` | `void` |

#### `Validator.validate(source, options?)`

验证成功时 resolve；失败时 reject `ValidateError[]`

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `source` / `options` | `Record<string, any>` / `ValidateOptions` | 见下表 | `Promise<void>` |

#### `Validator.falsy`

required 规则认定为空的值；数字 `0` 不为空

| 默认值 | 类型 |
| --- | --- |
| `[undefined, null, '']` | `any[]` |

#### `Validator.rules`

`updateRules()` 归一化后的字段规则

| 默认值 | 类型 |
| --- | --- |
| `{}` | `Record<string, ValidatorRule[]>` |

#### `Validator.paths`

嵌套验证时使用的错误路径前缀

| 默认值 | 类型 |
| --- | --- |
| `[]` | `(string \| number)[]` |

#### `Validator.original`

传入所有 transform/validate 上下文的原始数据

| 默认值 | 类型 |
| --- | --- |
| `undefined` | `any` |

修改邮箱和年龄后点击验证，查看成功结果或结构化错误：

:::playground
<!--
<config lang="json5">
{
	views: ['runtime', 'files']
}
</config>
-->
```vue
<script setup>
import { reactive, ref } from 'vue';
import { RegExps, Validator } from '@deot/helper-validator';

const form = reactive({ email: 'dev@example.com', age: 18 });
const output = ref({ status: '等待验证' });
const validator = new Validator({
	email: { pattern: RegExps.email, message: '邮箱格式不正确' },
	age: [
		{ required: true, message: '年龄必填' },
		{ validate: value => Number(value) >= 18, message: '年龄必须不小于 18' }
	]
});

// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const run = async () => {
	try {
		await validator.validate(form);
		output.value = { status: '通过', value: { ...form } };
	} catch (errors) {
		output.value = { status: '未通过', errors };
	}
};
</script>

<template>
	<div class="demo">
		<label>邮箱 <input v-model="form.email" type="email"></label>
		<label>年龄 <input v-model.number="form.age" type="number"></label>
		<button type="button" @click="run">验证</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo input, .demo button, .demo pre { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo input { width: 100%; max-width: 480px; box-sizing: border-box; }
.demo button { width: fit-content; color: white; cursor: pointer; background: #2563eb; }
.demo pre { margin: 0; white-space: pre-wrap; background: #f8fafc; }
</style>
```
:::

### 规则与验证类型

| 类型 | 字段 | 字段类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `ValidatorRule` | `required` | `boolean` | `false` | 非空规则；数组还要求每项非空 |
| `ValidatorRule` | `enum` | `(string \| number \| boolean \| null \| undefined)[]` | `[]` | 枚举值规则 |
| `ValidatorRule` | `pattern` | `RegExp \| string` | — | 正则表达式或正则字符串 |
| `ValidatorRule` | `transform` | `(value, context) => any` | 原样返回 | 验证前转换值 |
| `ValidatorRule` | `validate` | `(value, context) => Promise<any> \| boolean \| string \| void` | — | 自定义验证；`false`、错误字符串或 rejected Promise 表示失败 |
| `ValidatorRule` | `fields` | `ValidatorRules` | — | 验证嵌套对象或对象数组；与 validate 同时存在时以 validate 为准 |
| `ValidatorRule` | `message` | `string \| ((error) => string)` | `''` | 失败消息或消息生成器 |
| `ValidatorRule` | `[key: string]` | `any` | — | 允许规则携带额外业务字段 |
| `ValidateOptions` | `fields` | `string[]` | 全部规则字段 | 只验证指定字段 |
| `ValidateOptions` | `first` | `boolean` | `false` | 遇到第一个错误后停止 |
| `ValidateOptions` | `original` | `any` | 构造函数的 original | 传入所有验证上下文的原始数据 |
| `ValidateOptions` | `_index` | `number` | — | 嵌套数组校验使用的内部索引；不建议业务代码设置 |
| `ValidateContext` | `source` / `field` / `paths` / `original` | `Record<any, any>` / `string` / `(string \| number)[]` / `any` | — | transform 与 validate 接收的上下文 |
| `Transform` | — | `(value: any, context: ValidateContext) => any` | — | 字段校验前的值转换函数类型 |
| `Validate` | — | `(value: any, context: ValidateContext) => Promise<any> \| boolean \| string \| void` | — | 可单独导入的自定义校验函数类型 |
| `ValidateError` | `message?` / `value` / `field` / `paths` | `string` / `any` / `string` / `(string \| number)[]` | — | validate reject 的错误项结构 |
| `ValidatorMutipleRule` | — | `ValidatorRule \| Validate \| RegExp \| string \| boolean` | — | 单条规则支持的简写联合类型 |
| `ValidatorRules` | — | `Record<string, ValidatorMutipleRule \| ValidatorMutipleRule[]>` | — | 字段到一条或多条规则的映射 |

#### `RuleHelper`

根据常用配置生成 `ValidatorRule[]`，减少必填、格式、类型和范围规则的重复声明。

下表中的 `RuleOptions` 是 `RuleHelper.create()` 参数结构的文档名称，源码未将它作为独立类型导出。

| API | 参数 | 参数类型 | 默认值 | 返回值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `RuleHelper.required(message)` | `message` | `string` | — | `ValidatorRule[]` | 创建一条带消息的必填规则数组 |
| `RuleHelper.create(options?)` | `options` | `RuleOptions` | `name: '值'` | `ValidatorRule[]` | 按非空、格式、类型、范围和最大长度生成规则 |

| `RuleOptions` 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `required` | `boolean` | `false` | 是否生成必填规则；为 false 时其他规则允许空值 |
| `name` | `string` | `'值'` | 默认中文消息中的字段名 |
| `pattern` | `RegExp` | number 类型使用 `RegExps.number` | 格式校验正则 |
| `type` | `'number' \| 'string' \| 'array'` | — | 类型规则；number 同时生成数字格式规则 |
| `range` | `[number?, number?]` | `[]` | 数值上下界；数组值按 length 判断 |
| `maxlength` | `number` | — | 字符串最大长度 |
| `messages` | `{ required?; pattern?; type?; range?; maxlength? }` | 自动生成中文消息 | 覆盖各类错误消息 |
| `lang` | `string` | — | 预留语言字段，当前不参与逻辑 |

输入任意文本，同时查看全部内置正则结果，以及 `RuleHelper.required/create` 生成的规则结构：

:::playground
<!--
<config lang="json5">
{
	views: ['runtime', 'files']
}
</config>
-->
```vue
<script setup>
import { computed, ref } from 'vue';
import { RegExps, RuleHelper, Validator } from '@deot/helper-validator';

const input = ref('dev@example.com');
const patterns = [
	'number', 'number4', 'number6', 'integer', 'email', 'date', 'time',
	'identity', 'price', 'mobile', 'tel', 'wechat', 'name', 'dataURL', 'url'
];
const describeRules = rules => rules
	.map(rule => `${Object.keys(rule).sort().join(' + ')}: ${rule.message}`)
	.join(' | ');

// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => {
	const validator = new Validator();
	validator.updateRules({ value: RuleHelper.create({
		name: '数量', required: true, type: 'number', range: [1, 10]
	}) });
	return {
		RegExps: patterns
			.map(name => `${name}:${RegExps[name].test(input.value) ? '✓' : '×'}`)
			.join('  '),
		RuleHelper: {
			required: describeRules(RuleHelper.required('内容必填')),
			create: describeRules(validator.rules.value)
		},
		ValidatorFalsy: Validator.falsy.map(value => String(value))
	};
});
</script>

<template>
	<div class="demo">
		<label>文本输入 <input v-model="input"></label>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; gap: 10px; padding: 0; }
input, pre { margin: 0; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
input { width: 100%; max-width: 480px; box-sizing: border-box; }
pre { background: #f8fafc; }
</style>
```
:::

#### `RegExps`

所有成员均为 `RegExp`，可通过 `RegExps.<name>.test(value)` 使用。

| 名称 | 校验内容 | 名称 | 校验内容 |
| --- | --- | --- | --- |
| `number` | 正负整数或小数 | `number4` | 4 位数字 |
| `number6` | 6 位数字 | `integer` | 非零开头的正整数 |
| `email` | 常见邮箱格式 | `date` | `YYYY-MM-DD`、`/` 或 `.` 分隔日期 |
| `time` | `YYYY-MM-DD HH:mm` 格式 | `identity` | 至少 6 位字母或数字 |
| `price` | 最多 11 位整数、2 位小数的价格 | `mobile` | 中国大陆手机号段格式 |
| `tel` | 带区号和连字符的固定电话 | `wechat` | 至少 5 位字母、数字、下划线或连字符 |
| `name` | 中文、字母、数字、下划线或连字符 | `dataURL` | Data URL |
| `url` | 带协议的 URL | — | — |

## 规则

字段规则可以是单个值或数组，支持以下简写：

| 写法 | 归一化结果 |
| --- | --- |
| `true` / `false` | `{ required: value }` |
| `RegExp` / `string` | `{ pattern: value }` |
| `(value, context) => result` | `{ validate: fn }` |
| `ValidatorRule` | 完整规则对象 |

`ValidatorRule` 支持 `required`、`enum`、`pattern`、`transform`、`validate`、`fields` 和 `message`。`validate` 可返回 boolean、错误字符串、void 或 Promise；Promise rejection 的 message 会进入错误结果。

嵌套对象或数组使用 `fields`：

```ts
const validator = new Validator({
	users: {
		fields: {
			name: { required: true, message: '姓名必填' }
		}
	}
});
```

内置正则只用于通用格式校验，不应替代业务层规则或权威数据源验证。
