# egg-jsonp

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-jsonp.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-jsonp
[travis-image]: https://img.shields.io/travis/eggjs/egg-jsonp.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-jsonp
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-jsonp.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-jsonp?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-jsonp.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-jsonp
[snyk-image]: https://snyk.io/test/npm/egg-jsonp/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-jsonp
[download-image]: https://img.shields.io/npm/dm/egg-jsonp.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-jsonp

An egg plugin for jsonp support.

## Install

```bash
$ npm i egg-jsonp --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.jsonp = {
  enable: true,
  package: 'egg-jsonp',
};
```

## Configuration

* {String} callback - jsonp callback method key, default to `_callback`
* {Number} limit - callback method name's max length, default to `50`
* {Boolean} csrf - enable csrf check or not. default to false
* {String|RegExp|Array} whiteList - referrer white list

see [config/config.default.js](config/config.default.js) for more detail.

## Example

In `app/router.js`

```js
app.get('/default', app.enableJsonp(), 'jsonp.index');
app.get('/customize', app.enableJsonp({ callback: 'fn' }), 'jsonp.index');
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
