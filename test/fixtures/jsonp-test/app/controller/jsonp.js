'use strict';

exports.index = function*() {
  this.body = { foo: 'bar' };
};

exports.empty = function*() {};


exports.mark = function*() {
  this.body = { jsonpFunction: this.acceptJSONP };
};

exports.error = function*() {
  throw new Error('jsonpFunction is error');
};