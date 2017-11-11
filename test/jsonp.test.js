'use strict';

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
    yield app.httpRequest()
      .get('/default')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should support jsonp', function* () {
    yield app.httpRequest()
      .get('/default?callback=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should support _callback', function* () {
    yield app.httpRequest()
      .get('/default?_callback=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should support jsonp if response is empty', function* () {
    yield app.httpRequest()
      .get('/empty?callback=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn(null);');
  });

  it('should not support jsonp if not use jsonp middleware', function* () {
    yield app.httpRequest()
      .get('/disable?_callback=fn')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should not support cutom callback name', function* () {
    yield app.httpRequest()
      .get('/fn?fn=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});');
  });

  it('should not pass csrf', function* () {
    yield app.httpRequest()
      .get('/csrf')
      .expect(403);
  });

  it('should pass csrf with cookie', function* () {
    yield app.httpRequest()
      .get('/csrf')
      .set('cookie', 'csrfToken=token;')
      .set('x-csrf-token', 'token')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should pass csrf with cookie and support jsonp', function* () {
    yield app.httpRequest()
      .get('/csrf')
      .set('cookie', 'csrfToken=token;')
      .set('x-csrf-token', 'token')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should pass referrer white list check with subdomain', function* () {
    yield app.httpRequest()
      .get('/referrer/subdomain')
      .set('referrer', 'http://test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/subdomain')
      .set('referrer', 'http://sub.test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/subdomain')
      .set('referrer', 'https://sub.sub.test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/subdomain')
      .set('referrer', 'https://sub.sub.test1.com/')
      .expect(403)
      .expect(/jsonp request security validate failed/);
  });

  it('should pass referrer white list with domain', function* () {
    yield app.httpRequest()
      .get('/referrer/equal')
      .set('referrer', 'http://test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/equal')
      .set('referrer', 'https://test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/equal')
      .set('referrer', 'https://sub.sub.test.com/')
      .expect(403)
      .expect(/jsonp request security validate failed/);

    yield app.httpRequest()
      .get('/referrer/equal')
      .set('referrer', 'https://sub.sub.test1.com/')
      .expect(403)
      .expect(/jsonp request security validate failed/);
  });

  it('should pass referrer white array and regexp', function* () {
    yield app.httpRequest()
      .get('/referrer/regexp')
      .set('referrer', 'http://test.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/regexp')
      .set('referrer', 'https://foo.com/')
      .expect(200)
      .expect({ foo: 'bar' });

    yield app.httpRequest()
      .get('/referrer/regexp')
      .set('referrer', 'https://sub.sub.test.com/')
      .expect(403)
      .expect(/jsonp request security validate failed/);

    yield app.httpRequest()
      .get('/referrer/regexp')
      .set('referrer', 'https://sub.sub.test1.com/')
      .expect(403)
      .expect(/jsonp request security validate failed/);
  });

  it('should pass when pass csrf but not hit referrer white list', function* () {
    yield app.httpRequest()
      .get('/both')
      .set('cookie', 'csrfToken=token;')
      .set('x-csrf-token', 'token')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should pass when not pass csrf but hit referrer white list', function* () {
    yield app.httpRequest()
      .get('/both')
      .set('referrer', 'https://test.com/')
      .expect(200)
      .expect({ foo: 'bar' });
  });

  it('should 403 when not pass csrf and not hit referrer white list', function* () {
    yield app.httpRequest()
      .get('/both')
      .expect(403)
      .expect(/jsonp request security validate failed/);
  });

  it('should 403 when not pass csrf and referrer illegal', function* () {
    yield app.httpRequest()
      .get('/both')
      .set('referrer', '/hello')
      .expect(403)
      .expect(/jsonp request security validate failed/);
  });

  it('should pass and return is a jsonp function', function* () {
    yield app.httpRequest()
      .get('/mark?_callback=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn({"jsonpFunction":true});');
  });

  it('should pass and return is not a jsonp function', function* () {
    yield app.httpRequest()
      .get('/mark')
      .expect(200)
      .expect({ jsonpFunction: false });
  });

  it('should pass and return error message', function* () {
    yield app.httpRequest()
      .get('/error?_callback=fn')
      .expect(200)
      .expect('/**/ typeof fn === \'function\' && fn({"msg":"jsonpFunction is error"});');
  });
});
