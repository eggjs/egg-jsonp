'use strict';

const jsonpBody = require('jsonp-body');

module.exports = {
  /**
   * jsonp wrap body function
   * set jonsp response wrap function, othen plugin can use it.
   * @param {Object} body respones body
   * @public
   */
  jsonpResponseWrap(body) {
    if (!this.jsonpFunction) return;

    this.set('x-content-type-options', 'nosniff');
    this.type = 'js';
    body = body === undefined ? null : body;
    // protect from jsonp xss
    this.body = jsonpBody(body, this.jsonpFunction.name, this.jsonpFunction.option);
  },
};
