'use strict';

const jsonpBody = require('jsonp-body');
const is = require('is-type-of');
const url = require('url');

module.exports = {
  /**
   * return a middleware to enable jsonp response.
   * will do some security check inside.
   * @param  {Object} options jsonp options. can override `config.jsonp`.
   * @return {Function} jsonp middleware
   * @public
   */
  enableJsonp(options) {
    const defaultOptions = this.config.jsonp;
    options = Object.assign({}, defaultOptions, options);

    const csrfEnable =
      this.config.security.csrf && this.config.security.csrf.enable !== false // global csrf security enabled
      && options.csrf;  // jsonp csrf enabled

    if (!options.whiteList || !options.whiteList.length && !csrfEnable) {
      this.coreLogger.warn('[egg-jsonp] SECURITY WARNING!! csrf check and referrer check are both closed!');
    }
    const assertRerfer = createAssertReferer(options.whiteList);

    return function* jsonp(next) {
      // security checks
      if (csrfEnable) this.assertCsrf();
      assertRerfer(this.get('referrer'));

      yield next;

      const jsonpFunction = this.query[options.callback];
      if (jsonpFunction) {
        this.set('x-content-type-options', 'nosniff');
        this.type = 'js';
        const body = this.body === undefined ? null : this.body;
        this.body = jsonpBody(body, jsonpFunction, options);
      }
    };
  },
};

function createAssertReferer(whiteList) {
  if (!whiteList || !whiteList.length) return noop;
  if (!Array.isArray(whiteList)) whiteList = [ whiteList ];

  return function(referrer) {
    let match = false;
    let parsed = null;
    for (const item of whiteList) {
      if (is.regExp(item) && item.test(referrer)) {
        // regexp(/^https?:\/\/github.com\//): test the referrer with item
        match = true;
        break;
      } else {
        parsed = parsed || url.parse(referrer);
        const { hostname } = parsed;

        if (item[0] === '.' &&
          (hostname.endsWith(item) || hostname === item.slice(1))) {
          // string start with `.`(.github.com): referrer's hostname must ends with item
          match = true;
          return;
        } else if (hostname === item) {
          // string not start with `.`(github.com): referrer's hostname must strict equal to item
          match = true;
          return;
        }
      }
    }

    if (!match) {
      const err = new Error('jsonp referrer invalid');
      err.status = 403;
      throw err;
    }
  };
}

function noop() {}
