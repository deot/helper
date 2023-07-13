# @deot/helper-validator

### `Validator`
```js
import { Validator } from '@deot/helper-validator';

// or
import { Validator } from '@deot/helper';

```

- 示例
```js
const validator = new Validator({
	age: [
		{
			message: message1,
			// async
			validate: (value) => {
				return value < 30 ? Promise.reject('age < 30') : Promise.resolve();
			} 
		},
		{
			message: message2,
			// sync
			validate: (value) => {
				return value > 16;
			} 
		}
	]
});

try {
	await validator.validate({ age: 25 });
	console.log('pass');
} catch (errors: ValidateError[]) {
	console.log(errors);
}
```