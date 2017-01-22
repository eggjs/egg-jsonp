'use strict';

exports.index = function*() {
  this.body = { foo: 'bar' };
};

exports.empty = function*() {};
