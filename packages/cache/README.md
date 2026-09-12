# @deot/helper-cache

浏览器缓存工具，统一提供 `Storage`、`Cookie` 和 `IndexedDB` 风格的 `get`、`set`、`remove` 接口。

## 安装

```bash
pnpm add @deot/helper-cache
```

## 使用

```ts
import { Cookie, Storage, IndexedDB } from '@deot/helper-cache';

Storage.set('profile', { id: 1 });
Storage.get('profile');
Storage.remove('profile');

Cookie.set('token', 'value', { days: 7 });
await IndexedDB.set('draft', { title: 'Hello' });
```

也可以从聚合包导入：

```ts
import { Cookie, Storage, IndexedDB } from '@deot/helper';
```

## API

### Storage

封装 localStorage 与 sessionStorage，统一处理版本前缀、序列化和删除操作。

#### `Storage.configure(options)`

合并默认版本、保留版本及序列化配置，并清理未保留的旧版本数据

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `options` | `CacheOptions` | `void` |

#### `Storage.get(key, options?)`

从 localStorage 或 sessionStorage 读取并反序列化值

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key` / `options` | `string` / `StorageOptions` | `options.session: false` | `any \| null` |

#### `Storage.set(key, value, options?)`

序列化并写入值

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key` / `value` / `options` | `string` / `any` / `StorageOptions` | `options.session: false` | `void` |

#### `Storage.remove(key, options?)`

删除对应存储中的值

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key` / `options` | `string` / `StorageOptions` | `options.session: false` | `void` |

#### `Storage.getInvoke(options?)`

返回本次操作使用的存储名称

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `options` | `StorageOptions` | `options.session: false` | `'sessionStorage' \| 'localStorage'` |

#### `Storage.options`

当前全局版本及读写转换配置

| 类型 | 默认值 |
| --- | --- |
| `CacheOptions` | 见配置类型 |

#### `Storage.sessionStorage` / `Storage.localStorage`

浏览器存储写入失败时使用的实例内回退存储

| 类型 | 默认值 |
| --- | --- |
| MemoryStorage-like | 空内存存储 |

分别操作 localStorage 和 sessionStorage，查看删除前后的值：

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
/* eslint-disable no-useless-assignment */
import { ref } from 'vue';
import { Storage } from '@deot/helper-cache';

const key = 'helper-playground';
const output = ref({ status: '请选择一种 Storage' });

const runStorage = (session = false) => {
	const options = { session };
	Storage.set(key, { source: session ? 'sessionStorage' : 'localStorage', value: 1 }, options);
	const beforeRemove = Storage.get(key, options);
	Storage.remove(key, options);
	output.value = {
		methods: ['Storage.set', 'Storage.get', 'Storage.remove'],
		beforeRemove,
		afterRemove: Storage.get(key, options)
	};
};

</script>

<template>
	<div class="demo">
		<div class="actions">
			<button @click="runStorage(false)">localStorage</button>
			<button @click="runStorage(true)">sessionStorage</button>
		</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

### Cookie

提供与 `Storage` 相近的键值接口，并支持有效期、路径和域名配置。

#### `Cookie.configure(options)`

合并序列化与反序列化配置

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `options` | `CacheOptions` | `void` |

#### `Cookie.get(key)`

读取并反序列化 Cookie

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `key` | `string` | `any \| null` |

#### `Cookie.set(key, value, options?)`

序列化并写入 Cookie

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key` / `value` / `options` | `string` / `any` / `CookieOptions` | 12 小时；`path: '/'` | `void` |

#### `Cookie.remove(key, options?)`

使用相同 path/domain 删除 Cookie

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key` / `options` | `string` / `CookieOptions` | `path: '/'` | `void` |

#### `Cookie.options`

当前读写转换和版本配置；Cookie key 不使用版本前缀

| 类型 | 默认值 |
| --- | --- |
| `CacheOptions` | 见配置类型 |

写入、读取并删除一个 Cookie，查看每一步的结果：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
/* eslint-disable no-useless-assignment */
import { ref } from 'vue';
import { Cookie } from '@deot/helper-cache';

const key = 'helper-cookie-playground';
const output = ref({ status: '点击运行' });

const run = () => {
	Cookie.set(key, { source: 'cookie', value: 2 });
	const beforeRemove = Cookie.get(key);
	Cookie.remove(key);
	output.value = { beforeRemove, afterRemove: Cookie.get(key) };
};
</script>

<template>
	<div class="demo">
		<button @click="run">运行 Cookie 操作</button>
		<strong>输出</strong><pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

### IndexedDBStore

封装 IndexedDB 数据库连接、记录 CRUD 和键值存储；共享实例 `IndexedDB` 使用默认配置。

#### `new IndexedDBStore(options?)`

创建独立数据库实例；`IndexedDB` 是使用默认配置的共享实例

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `options` | `IndexedDBOptions` | 见下表 | `IndexedDBStore` |

#### `IndexedDBStore.getUid()`

生成实例内递增主键

| 返回值 |
| --- |
| `string` |

#### `IndexedDBStore.configure(options)`

合并数据库和转换器配置

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `options` | `IndexedDBOptions` | `void` |

#### `IndexedDBStore.openDatabase()`

打开数据库，并在升级时重建 object store

| 返回值 |
| --- |
| `Promise<IDBDatabase>` |

#### `IndexedDBStore.openObjectStore(mode?)`

打开当前 object store

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `mode` | `IDBTransactionMode` | `'readwrite'` | `Promise<IDBObjectStore>` |

#### `IndexedDBStore.close(target?)`

等待指定或全部任务后关闭连接

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `target` | `Promise<any>` | 等待全部任务 | `Promise<void>` |

#### `IndexedDBStore.deleteDatabase()`

删除当前数据库

| 返回值 |
| --- |
| `Promise<void>` |

#### `IndexedDBStore.write(data)`

生成主键并新增记录

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `data` | `object` | `Promise<State>` |

#### `IndexedDBStore.read(id)`

按主键读取记录

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `id` | `string` | `Promise<State \| undefined>` |

#### `IndexedDBStore.update(id, data)`

按主键覆盖记录

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `id` / `data` | `string` / `object` | `Promise<State>` |

#### `IndexedDBStore.delete(id)`

按主键删除记录

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `id` | `string` | `Promise<void>` |

#### `IndexedDBStore.search()`

读取 object store 的全部记录

| 返回值 |
| --- |
| `Promise<State[]>` |

#### `IndexedDBStore.get(key)`

读取键值接口中的 `data` 字段并反序列化

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `key` | `string` | `Promise<any \| null>` |

#### `IndexedDBStore.set(key, value)`

以主键写入键值数据

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `key` / `value` | `string` / `any` | `Promise<void>` |

#### `IndexedDBStore.remove(key)`

删除键值数据

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `key` | `string` | `Promise<void>` |

#### 公开状态

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `options` | `IndexedDBOptions` | 当前数据库、object store、版本和转换配置 |
| `timestramp` / `count` | `number` | `getUid()` 使用的实例时间戳与递增计数 |
| `db` | `Promise<IDBDatabase> \| null` | 当前复用的数据库连接；无连接时为 `null` |
| `pending` | `Promise<any>[]` | 正在进行的数据库任务；`close()` 会等待或移除其中的任务 |

使用独立测试数据库依次执行底层打开、记录 CRUD、键值接口、关闭和删除数据库：

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
/* eslint-disable no-useless-assignment */
import { ref } from 'vue';
import { IndexedDBStore } from '@deot/helper-cache';

const output = ref({ status: '点击运行；结束后测试数据库会被删除' });

const run = async () => {
	const store = new IndexedDBStore({
		name: 'helper-docs-playground',
		storeName: 'records',
		keyPath: 'id',
		version: 1
	});
	await store.close();
	await store.deleteDatabase();
	const database = await store.openDatabase();
	const objectStore = await store.openObjectStore('readonly');
	await store.close();

	const created = await store.write({ title: 'Draft' });
	const read = await store.read(created.id);
	const updated = await store.update(created.id, { title: 'Published' });
	const searched = await store.search();
	await store.delete(created.id);
	const afterDelete = await store.read(created.id);
	await store.set('settings', { theme: 'dark' });
	const value = await store.get('settings');
	await store.remove('settings');
	const afterRemove = await store.get('settings');
	await store.close();
	await store.deleteDatabase();

	output.value = {
		openDatabase: database.name,
		openObjectStore: objectStore.name,
		write: created,
		read,
		update: updated,
		search: searched,
		delete: afterDelete ?? null,
		keyValue: { beforeRemove: value, afterRemove },
		cleanup: ['close', 'deleteDatabase']
	};
};
</script>

<template>
	<div class="demo">
		<button @click="run">运行 IndexedDB 全流程</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `IndexedDB`

使用默认配置创建的共享 `IndexedDBStore` 实例，公开方法、状态和运行环境要求与上节相同。需要隔离数据库名称、object store 或生命周期时，应改为创建独立的 `IndexedDBStore`。

### 配置类型

下列 `CacheOptions`、`StorageOptions`、`CookieOptions` 和 `IndexedDBOptions` 是对公开参数结构的文档命名，不是可从包中单独导入的类型。

| 类型 | 字段 | 字段类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `CacheOptions` | `version` | `string \| number` | `''` | Storage key 前缀或 IndexedDB 版本 |
| `CacheOptions` | `versions` | `Array<string \| number>` | `[]` | Storage 初始化时需要保留的版本 |
| `CacheOptions` | `get` | `(value: any) => any` | `flattenJSONParse` | 读取后的转换器 |
| `CacheOptions` | `set` | `(value: string) => string` | 原样返回 | 写入前的转换器 |
| `StorageOptions` | `session` | `boolean` | `false` | 是否使用 sessionStorage |
| `StorageOptions` | `version` | `string \| number` | 全局版本 | 覆盖当前操作的版本前缀 |
| `CookieOptions` | `days` | `number` | `0.5` | Cookie 保存天数 |
| `CookieOptions` | `path` | `string` | `'/'` | Cookie 路径 |
| `CookieOptions` | `domain` | `string` | 当前域名 | Cookie 域名 |
| `IndexedDBOptions` | `keyPath` | `string` | `'__id'` | object store 主键字段 |
| `IndexedDBOptions` | `name` | `string` | `'default-db'` | 数据库名称 |
| `IndexedDBOptions` | `storeName` | `string` | `'default-store'` | object store 名称 |
| `IndexedDBOptions` | `version` | `string \| number` | `1` | 数据库版本；字符串会转换为整数 |

## 存储说明

`options.version` 可覆盖全局版本。版本化 key 使用 `@deot/helper/{version}:` 前缀；`configure({ version, versions })` 会清理未保留的旧版本 localStorage 数据。

未设置 `days` 时默认保存 12 小时。

## IndexedDB

`IndexedDB` 是默认实例；需要隔离多个数据库时创建 `IndexedDBStore`：

```ts
import { IndexedDBStore } from '@deot/helper-cache';

const records = new IndexedDBStore({
	name: 'my-db',
	storeName: 'records',
	keyPath: 'id',
	version: 1
});

const row = await records.write({ title: 'Draft' });
await records.update(row.id, { title: 'Published' });
const all = await records.search();
await records.delete(row.id);
```

## 运行环境

这些实现以浏览器 API 为目标。`Storage`、`Cookie` 以及 `IndexedDB` 的 `get`、`set`、`remove` 在不支持对应存储或服务端渲染环境中会安全跳过写操作，读操作返回 `null`。`IndexedDBStore` 的数据库与记录操作依赖 `window.indexedDB`，仅应在浏览器环境调用；其 API 始终按 Promise 使用。
