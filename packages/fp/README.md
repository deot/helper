# @deot/helper-fp

### `FP`
```js
import * as FP from '@deot/helper-fp';
```
```js
// or
import { FP } from '@deot/helper';
```

- pipeline 函数管道，配合函数链的函数式工具
- combinator 函数组合子，配合函数链的控制流
- functor 函子，用于形成函数链，配合异常异步等行为

combinator / pipeline 可以考虑直接使用ramda

> `Ramda` 的目标更为专注：专门为函数式编程风格而设计，更容易创建函数式 `pipeline`、且从不改变用户已有数据。

## 参考

《JavaScript函数式编程指南（异步图书）》路易斯·阿泰西奥
> 我个人对函子部分的理解和本书不太一致，做了部分修改