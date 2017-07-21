'use strict';

const request = require('supertest');
const mm = require('egg-mock');

describe('test/jsonp.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'jsonp-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mm.restore);

  it('should support json', function* () {
    yield request(app.callback())
    .get('/default')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should support jsonp', function* () {
    yield request(app.callback())
    .get('/default?callback=fn')
    .expect(200)
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should support _callback', function* () {
    yield request(app.callback())
    .get('/default?_callback=fn')
    .expect(200)
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should support jsonp if response is empty', function* () {
    yield request(app.callback())
    .get('/empty?callback=fn')
    .expect(200)
    .expect('/**/ typeof fn === \'function\' && fn(null);');
  });

  it('should not support jsonp if not use jsonp middleware', function* () {
    yield request(app.callback())
    .get('/disable?_callback=fn')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should not support cutom callback name', function* () {
    yield request(app.callback())
    .get('/fn?fn=fn')
    .expect(200)
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should not pass csrf', function* () {
    yield request(app.callback())
    .get('/csrf')
    .expect(403);
  });

  it('should pass csrf with cookie', function* () {
    yield request(app.callback())
    .get('/csrf')
    .set('cookie', 'csrfToken=token;')
    .set('x-csrf-token', 'token')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should pass csrf with cookie and support jsonp', function* () {
    yield request(app.callback())
    .get('/csrf')
    .set('cookie', 'csrfToken=token;')
    .set('x-csrf-token', 'token')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should pass referrer white list check with subdomain', function* () {
    yield request(app.callback())
    .get('/referrer/subdomain')
    .set('referrer', 'http://test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/subdomain')
    .set('referrer', 'http://sub.test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/subdomain')
    .set('referrer', 'https://sub.sub.test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/subdomain')
    .set('referrer', 'https://sub.sub.test1.com/')
    .expect(403)
    .expect(/jsonp request security validate failed/);
  });

  it('should pass referrer white list with domain', function* () {
    yield request(app.callback())
    .get('/referrer/equal')
    .set('referrer', 'http://test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/equal')
    .set('referrer', 'https://test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/equal')
    .set('referrer', 'https://sub.sub.test.com/')
    .expect(403)
    .expect(/jsonp request security validate failed/);

    yield request(app.callback())
    .get('/referrer/equal')
    .set('referrer', 'https://sub.sub.test1.com/')
    .expect(403)
    .expect(/jsonp request security validate failed/);
  });

  it('should pass referrer white array and regexp', function* () {
    yield request(app.callback())
    .get('/referrer/regexp')
    .set('referrer', 'http://test.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/regexp')
    .set('referrer', 'https://foo.com/')
    .expect(200)
    .expect({ foo: 'bar' });

    yield request(app.callback())
    .get('/referrer/regexp')
    .set('referrer', 'https://sub.sub.test.com/')
    .expect(403)
    .expect(/jsonp request security validate failed/);

    yield request(app.callback())
    .get('/referrer/regexp')
    .set('referrer', 'https://sub.sub.test1.com/')
    .expect(403)
    .expect(/jsonp request security validate failed/);
  });

  it('should pass when pass csrf but not hit referrer white list', function* () {
    yield request(app.callback())
    .get('/both')
    .set('cookie', 'csrfToken=token;')
    .set('x-csrf-token', 'token')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should pass when not pass csrf but hit referrer white list', function* () {
    yield request(app.callback())
    .get('/both')
    .set('referrer', 'https://test.com/')
    .expect(200)
    .expect({ foo: 'bar' });
  });

  it('should 403 when not pass csrf and not hit referrer white list', function* () {
    yield request(app.callback())
    .get('/both')
    .expect(403)
    .expect(/jsonp request security validate failed/);
  });

  it('should 403 when not pass csrf and referrer illegal', function* () {
    yield request(app.callback())
    .get('/both')
    .set('referrer', '/hello')
    .expect(403)
    .expect(/jsonp request security validate failed/);
  });
});
