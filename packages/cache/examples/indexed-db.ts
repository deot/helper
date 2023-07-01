import { IndexedDB, IndexedDBStore } from "@deot/helper-cache";

await IndexedDB.set('user', { name: 'name' });
await IndexedDB.get('user');


await IndexedDB.set('user', 'name');
const v = await IndexedDB.get('user');

console.log('await', v);

await IndexedDB.deleteDatabase();

await IndexedDB.write({ key: 'name0' });
await IndexedDB.write({ key: 'name0' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key2: 'name2' });
await IndexedDB.write({ key3: 'name3' });
await IndexedDB.write({ key4: 'name3' });

const data1 = await IndexedDB.search();

console.log('await', data1);

const store = new IndexedDBStore({
	name: 'db',
	storeName: 'store'
});

store.deleteDatabase();

let length = 1000;
Array
	.from({ length })
	.forEach((_: any, index: number) => {
		store.write({ value: index });
	});

console.log('batch, write end', `pending: ${store.pending.length}`);
let target = store.close();

Array
	.from({ length })
	.forEach((_: any, index: number) => {
		store.write({ value: index });
	});

console.log('batch, closing add', `pending: ${store.pending.length}`);
await target;
console.log('batch, close end', `pending: ${store.pending.length}`);
const data2 = await store.search();
console.log('batch, search end', `data: ${data2.length}`, `pending: ${store.pending.length}`);