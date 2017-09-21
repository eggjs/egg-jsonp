'use strict';

const jsonpBody = require('jsonp-body');
const JSONP_CONFIG = Symbol.for('jsonp#config');

module.exports = {
  /**
   * detect if response should be jsonp
   */
  get acceptJSONP() {
    return !!(this[JSONP_CONFIG] && this[JSONP_CONFIG].jsonpFunction);
  },

  /**
   * jsonp wrap body function
   * set jonsp response wrap function, othen plugin can use it.
   * @param {Object} body respones body
   * @public
   */
  wrapJsonp(body) {
    const jsonpConfig = this[JSONP_CONFIG];
    if (!jsonpConfig || !jsonpConfig.jsonpFunction) {
      this.body = body;
      return;
    }

    this.set('x-content-type-options', 'nosniff');
    this.type = 'js';
    body = body === undefined ? null : body;
    // protect from jsonp xss
    this.body = jsonpBody(body, jsonpConfig.jsonpFunction, jsonpConfig.options);
  },
};
