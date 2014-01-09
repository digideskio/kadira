var assert = require('assert');
var http = require('http');

suite('Hijack - HTTP', function() {
  test('call some server', function(done, server, client) {
    server.evalSync(function() {
      app = Npm.require('http').createServer(function(req, res) {
        res.writeHead(200);
        res.end('hello');
      });
      app.listen(4249, function() {
        emit('return');
      });
    });

    server.evalSync(function() {
      Meteor.methods({
        'http': function() {
          var result = HTTP.get('http://localhost:4249');
          return result.statusCode;
        }
      });
      
      emit('return');
    });

    var statusCode = callMethod(client, 'http');
    assert.equal(statusCode, 200);

    var events = getLastMethodEvents(server, ['type', 'data']);
    assert.deepEqual(events, [
      {type: 'start', data: undefined},
      {type: 'wait', data: {waitOn: []}},
      {type: 'waitend', data: undefined},
      {type: 'http', data: {url: "http://localhost:4249", method: "GET"}},
      {type: 'httpend', data: {statusCode: 200}},
      {type: 'complete', data: undefined},
    ]);

    server.evalSync(function() {
      app.close(function() {
        emit('return');
      });
    });
    
    done();

  });
});