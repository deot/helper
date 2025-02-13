# @deot/helper ChangeLog

## v1.1.9

_2025-02-13_

### Bugfixes

- fix(wheel): boundary value contrast error ([00df8b5](https://github.com/deot/helper/commit/00df8b5da36ada0832fc4f18a65f38fcaf391b54))

### Features

- feat(wheel): native behavior when nested ([225a0f4](https://github.com/deot/helper/commit/225a0f41356b42700eae10fa4c0492e14080417f))

## v1.1.8

_2025-01-10_

### Bugfixes

- fix(route):  parse `url` failed ([93b589f](https://github.com/deot/helper/commit/93b589f49d787b888c9b735da4f84e549f596092))

### Features

- feat(validator): original for validate ([f25a58d](https://github.com/deot/helper/commit/f25a58d71af3179616106682bee03d909e243822))

## v1.1.7

_2024-06-28_

### Bugfixes

- fix(cache): catch need the exception value(mp-alipay) ([4e4398a](https://github.com/deot/helper/commit/4e4398a98200f818c44c866d740a7df43c7120e4))

## v1.1.6

_2024-06-27_

### Bugfixes

- fix(cache,scheduler,utils): catch need the exception value(mp-alipay) ([6611477](https://github.com/deot/helper/commit/661147703e8f19acb22928b5272b9cabe2af3eed))

## v1.1.5

_2023-12-21_

### Bugfixes

- fix(scheduler): allow micro task before `await scheduler` ([0133e47](https://github.com/deot/helper/commit/0133e4717576c708d773a3f170477222abbdf881))

### Features

- feat(scheduler): `scheduler` -> `interrupter` ([8cee40e](https://github.com/deot/helper/commit/8cee40e634c92334ac209558fe9e0b146c39ef9b))

## v1.1.4

_2023-12-18_

### Features

- feat(scheduler): initial commit ([c572d8e](https://github.com/deot/helper/commit/c572d8e24340302ffe3ed4683062119cfe94ffe5))

## v1.1.3

_2023-11-22_

### Updates

- chore(wheel): force-publish `1.1.1` -> `1.1.3`

## v1.1.2

_2023-11-16_

### Features

- feat(utils): add `toPromise` ([b25c820](https://github.com/deot/helper/commit/b25c820250f686798dde2c0c1f1cd34b0acf61a8))
- feat(validator): `InternalRule` -> `ValidatorRule` ([70e1e00](https://github.com/deot/helper/commit/70e1e0090099c95a840f595556db15b60893b7c4))
- feat(validator): allow `validate` return string type as a error ([0520782](https://github.com/deot/helper/commit/052078269e0f7139bcfdf1b1f37b1f77ca10fda9))

## v1.1.1

_2023-08-25_

### Updates

- chore(wheel): force-publish `1.1.0` -> `1.1.1`

## v1.1.0

_2023-08-24_

### Updates

- chore(wheel): force-publish `1.0.1` -> `1.1.0`

## v1.0.3

_2023-08-21_

### Features

- feat(utils): add `genterateString` ([5341a3e](https://github.com/deot/helper/commit/5341a3e04d87258d062ac4b6b931b54e4a4629a1))
- feat(is): add `typedArray` ([9327863](https://github.com/deot/helper/commit/93278638c56545d62a645ffb8f270ae5d3a8a3c3))

## v1.0.2

_2023-08-17_

### Bugfixes

- fix(utils): type namespace adjust ([e063492](https://github.com/deot/helper/commit/e063492e529f95516661cc58cea8c5733fa6e972))
- fix(shared): incorrect build & relation build by `@deot/dev@2.3.3` ([59cd683](https://github.com/deot/helper/commit/59cd683d73630d99ef8a96ba2f843769c0eafa1d))

### Features

- feat: `@deot/helper-is` exposed ([f2f89f8](https://github.com/deot/helper/commit/f2f89f8e516194a505ec6a404702f6c32a5e945f))
- feat(utils): `flattenDecodeURIComponent` ->  `flatten` ([3ae2955](https://github.com/deot/helper/commit/3ae29553e06a0309c227075551543dd3179173a7))
- feat(utils): remove `isObj` method ([57f8ce2](https://github.com/deot/helper/commit/57f8ce2b36878a22cfecba67a57df4d752b04bd2))
- feat(is): coverage & completion ([b57e914](https://github.com/deot/helper/commit/b57e91404072fc0b8eb91e004cd579f582ebe571))

## v1.0.1

_2023-07-13_

### Features

- feat(cache): [indexed-db] batch operate ([2726e3f](https://github.com/deot/helper/commit/2726e3f679e9c572b73fc8c4fddf189b1ff478df))
- feat(cache): coverage & completion ([86c4e5c](https://github.com/deot/helper/commit/86c4e5c5f93c8b06bda02d897c91cbfb23597e39))
- feat(utils): coverage & completion ([ae8c48b](https://github.com/deot/helper/commit/ae8c48b85e994e7dccc7f5d132b4bd57792f546c))
- feat(device): coverage & completion ([86662c5](https://github.com/deot/helper/commit/86662c577eb47595a919c1c6acb47b60bba55ef0))
- feat(dom): coverage & completion ([78ce1ce](https://github.com/deot/helper/commit/78ce1ce1b7a47dc436688d4e167e666cb70d435a))
- feat(emitter): coverage & completion ([91951c3](https://github.com/deot/helper/commit/91951c379dad6939f7520b02717ed1441f28bd9d))
- feat(fp): [pipeline] add, subtract, divide, multiply ([1ba8c2c](https://github.com/deot/helper/commit/1ba8c2c76c6dde7c83578664e264080c7255ae8a))
- feat(fp): coverage & completion ([0045e2c](https://github.com/deot/helper/commit/0045e2caf681fffb442daf0be886c1c41d9ded55))
- feat(load): coverage & completion ([c98647d](https://github.com/deot/helper/commit/c98647de41e3b1fe2531551bee74337c3225aa79))
- feat(resize): coverage & completion ([2395815](https://github.com/deot/helper/commit/2395815d9b8d2a0ffc9f41bece2dfa38c5a07759))
- feat(route): coverage & completion ([f85229e](https://github.com/deot/helper/commit/f85229efcd2be82eac39df4f49f5808c0f251cb1))
- feat(shared): coverage & completion ([ca2c217](https://github.com/deot/helper/commit/ca2c217c2a70490b131d98a242200f40e79671fc))
- feat(unicode): coverage & completion ([90f8fa6](https://github.com/deot/helper/commit/90f8fa6fe993ed06848c03f74588a330f7b013b2))
- feat(validator): coverage & completion ([421e85c](https://github.com/deot/helper/commit/421e85cb98332173120e2c0e04428d0a1756a83e))
- feat(wheel): coverage & completion ([d123521](https://github.com/deot/helper/commit/d1235210d5c44d99ae09bc1e3cfa598b5a262e1a))

### Updates

- style(resize): only `__rz__` expose on `el` ([624d101](https://github.com/deot/helper/commit/624d10154237d6f2e28ee87a8186002f30d9e9c3))
