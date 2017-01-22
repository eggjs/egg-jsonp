'use strict';

module.exports = app => {
  app.get('/default', app.enableJsonp(), 'jsonp.index');
  app.get('/empty', app.enableJsonp(), 'jsonp.empty');
  app.get('/disable', 'jsonp.index');
  app.get('/fn', app.enableJsonp({ callback: 'fn' }), 'jsonp.index');
  app.get('/referrer/subdomain', app.enableJsonp({ whiteList: '.test.com' }), 'jsonp.index');
  app.get('/referrer/equal', app.enableJsonp({ whiteList: 'test.com' }), 'jsonp.index');
  app.get('/referrer/regexp', app.enableJsonp({ whiteList: [/https?:\/\/test\.com\//, /https?:\/\/foo\.com\//] }), 'jsonp.index');
  app.get('/csrf', app.enableJsonp({ csrf: true }), 'jsonp.index');
  app.get('/both', app.enableJsonp({ csrf: true, whiteList: 'test.com' }), 'jsonp.index');
};
