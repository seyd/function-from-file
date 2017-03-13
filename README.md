
# function-from-file
![platform-image] ![license-image] ![tested-image] ![coverage-image]

Node.js module for extracting function from given javascript file (great for unit testing).
* both **sync** or **async** options
* reach **private functions** also
* simple way of **mocking** inner dependecies

One condition only: *"**function must have a name**".*

Keywords: `functions`, `private function`, `unit tests`, `unittest`, `testing`, `get function`, `extract function`, `parse function`, `find function`.

## Example

```js
var getFunction = require("function-from-file");
var privateFunction = getFunction('./foo/bar.js', 'someFunction');

// you can use imported function now
privateFunction();
```

## Motivation
When writing unit tests, private functions inside your module are not accessible from outside (via `require` statement). With this tool you can get and test any function by its name.

## Installation
Use `--save-dev` parameter if you are going use this module just for development (e.g. testing) or `--save` if your application is using it.
```
$ npm install function-from-file --save-dev
```

## Features / API

### Sync
This example extracts a function *addNumbers* from script `./foo/bar.js`
```js
var add = getFunction('./foo/bar.js', 'addNumbers');
var result = add(100, 50);
```

### Get more functions at once
If array of function names is given, returns an object where keys are those functions.
```js
var fns = getFunction('./foo/bar.js', ['foo', 'bar']);
fns.foo();
fns.bar();
```

### Async
To get a function asynchronous add the last parameter as a callback function:
```js
getFunction('./foo/bar.js', 'addNumbers', function(err, result) {
    if (err) throw err;
    console.log( result(100, 50) );
});
```
It works with more function names also (like the sync variant):
```js
getFunction('./foo/bar.js', ['foo', 'bar'], function(err, result) {
    if (err) throw err;
    result.foo();
    result.bar();
});
```

### Mock dependecies
Sometimes you extract function that has some dependencies on other functions or variables. See this example:
```js
// File foo/bar.js
var koef = 8;
function multiplier(a) {
    return a * koef;
}
```
When you extract function (**not working solution**):
```js
var fn = getFunction('./foo/bar.js', 'multiplier');
fn(2);
```
This code throws error: *Uncaught ReferenceError: koef is not defined*.

**Working solution** is to mock (define localy) all the dependencies:
```js
var fn = getFunction('./foo/bar.js', 'multiplier');
var koef = 8;
eval('var mockedFn = '+fn);
mockedFn(4);
```
The function *fn* in *eval* statement was converted to string so it evals:
`eval("var mockedFn = function multiplier(a) { return a * koef; }");`
Now it uses the local variable *koef*.

### Caching
The most expensive operation is reading a file and parsing a source code and looking for a functions. So this is why caching is implemented. When you are getting function from the same file, cached result is used. Caching is default turned on, but you can turn it off.

**Disable cache**

To turn the caching off call the: 
```js
var getFunction = require("function-from-file");
getFunction.disableCache();
```

**Enable cache**

To turn the caching on call the: 
```js
var getFunction = require("function-from-file");
getFunction.enableCache();
```

**Clear cache**

To clear the cache call the:
```js
var getFunction = require("function-from-file");
getFunction.clearCache();
```

## Tests
To run the tests, at first install the dependencies: `$ npm install`

Running unit tests: `$ npm test`

Running coverage tests: `$ npm run test-cov`

## Author
**Johnny Seyd** at [GitHub](https://github.com/seyd) <[johnnyseyd@gmail.com](mailto:johnnyseyd@gmail.com)>

## Credits
Build on the module [function-extractor](https://github.com/gjtorikian/function-extractor), based on [esprima](https://www.npmjs.com/package/esprima) and other included submodules.

## License

  [BSD](LICENSE)

[platform-image]: https://img.shields.io/badge/platform-Node.js-green.svg
[license-image]: https://img.shields.io/badge/license-MIT-orange.svg
[tested-image]: https://img.shields.io/badge/tested-well-yellow.svg
[coverage-image]: https://img.shields.io/badge/coverage-100%25-blue.svg