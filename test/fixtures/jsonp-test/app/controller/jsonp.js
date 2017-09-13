'use strict';

exports.index = function*() {
  this.body = { foo: 'bar' };
};

exports.empty = function*() {};

exports.mark = function*() {
  this.body = { jsonpFunction: this.jsonpFunction && this.jsonpFunction.name };
};

exports.error = function*() {
  try {
    this.jsonpFunction = 'readonly';
  } catch (error) {
    throw new Error('jsonpFunction is readonly');
  }
};
