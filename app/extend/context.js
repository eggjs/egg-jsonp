'use strict';

const jsonpBody = require('jsonp-body');
const { JSONP_CONFIG, JSONP_WRAPPER } = require('../../lib/private_key');

module.exports = {
  /**
   * detect if response should be jsonp
   */
  get acceptJSONP() {
    return !!(this[JSONP_CONFIG] && this[JSONP_CONFIG].jsonpFunction);
  },

  /**
   * jsonp wrap body function
   * set jsonp response wrap function, other plugin can use it.
   * @param {Object} body respones body
   * @public
   */
  [JSONP_WRAPPER](body) {
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
