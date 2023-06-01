### 约定

```
let url = `?a=${encodeURIComponent('&')}`; // '?a=%26'

decodeURIComponent(url); // a=&

encodeURIComponent(url); // '%3Fa%3D%2526'
```

- 期望： `{ a: '&' }`
- 实际： `{ a: '' }`

为了避免该情况，内部对`url`不直接`decodeURIComponent`, 仅当对值进行`decodeURIComponent`. 所以`%3Fa%3D%2526`是无效的; 

`merge`调用时，`value`的值会被`decodeURIComponent`

```js
get('a', '?a=%26'); // &

merge({ query: { a: '&' } }); // ?a=%26

parse('?a=%26'); // query.a === '&' (true)
```