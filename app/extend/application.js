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
  jsonp(options) {
    const defaultOptions = this.config.jsonp;
    options = Object.assign({}, defaultOptions, options);
    if (!Array.isArray(options.callback)) options.callback = [ options.callback ];

    const csrfEnable = this.plugins.security && this.plugins.security.enable // security enable
       && this.config.security.csrf && this.config.security.csrf.enable !== false // csrf enable
      && options.csrf;  // jsonp csrf enabled

    const validateReferrer = options.whiteList && createValidateReferer(options.whiteList);

    if (!csrfEnable && !validateReferrer) {
      this.coreLogger.warn('[egg-jsonp] SECURITY WARNING!! csrf check and referrer check are both closed!');
    }
    /**
     * jsonp request security check, pass if
     *
     * 1. hit referrer white list
     * 2. or pass csrf check
     * 3. both check are disabled
     *
     * @param  {Context} ctx request context
     */
    function securityAssert(ctx) {
      // all disabled. don't need check
      if (!csrfEnable && !validateReferrer) return;

      // pass referrer check
      const referrer = ctx.get('referrer');
      if (validateReferrer && validateReferrer(referrer)) return;
      if (csrfEnable && validateCsrf(ctx)) return;

      const err = new Error('jsonp request security validate failed');
      err.referrer = referrer;
      err.status = 403;
      throw err;
    }

    return function* jsonp(next) {
      // before handle request, must do some security checks
      securityAssert(this);

      yield next;

      // generate jsonp body
      const jsonpFunction = getJsonpFunction(this.query, options.callback);
      if (jsonpFunction) {
        this.set('x-content-type-options', 'nosniff');
        this.type = 'js';
        const body = this.body === undefined ? null : this.body;
        // protect from jsonp xss
        this.body = jsonpBody(body, jsonpFunction, options);
      }
    };
  },
};

function createValidateReferer(whiteList) {
  if (!Array.isArray(whiteList)) whiteList = [ whiteList ];

  return function(referrer) {
    let parsed = null;
    for (const item of whiteList) {
      if (is.regExp(item) && item.test(referrer)) {
        // regexp(/^https?:\/\/github.com\//): test the referrer with item
        return true;
      }

      parsed = parsed || url.parse(referrer);
      const { hostname } = parsed;

      if (item[0] === '.' &&
        (hostname.endsWith(item) || hostname === item.slice(1))) {
        // string start with `.`(.github.com): referrer's hostname must ends with item
        return true;
      } else if (hostname === item) {
        // string not start with `.`(github.com): referrer's hostname must strict equal to item
        return true;
      }
    }

    return false;
  };
}

function validateCsrf(ctx) {
  try {
    ctx.assertCsrf();
    return true;
  } catch (_) {
    return false;
  }
}

function getJsonpFunction(query, callbacks) {
  for (const callback of callbacks) {
    if (query[callback]) return query[callback];
  }
}
