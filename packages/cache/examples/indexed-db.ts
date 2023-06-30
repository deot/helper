import { IndexedDB } from "@deot/helper-cache";

await IndexedDB.set('user', { name: 'name' });
await IndexedDB.get('user');


await IndexedDB.set('user', 'name');
const v = await IndexedDB.get('user');

console.log(v);

await IndexedDB.deleteDatabase();

await IndexedDB.write({ key: 'name0' });
await IndexedDB.write({ key: 'name0' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key1: 'name1' });
await IndexedDB.write({ key2: 'name2' });
await IndexedDB.write({ key3: 'name3' });
await IndexedDB.write({ key4: 'name3' });

const data = await IndexedDB.search();

console.log(data, 2);