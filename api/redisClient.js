var url = require('url');
var _ = require('underscore');
var querystring = require('querystring');

var Promise = require("bluebird");

// setup redis
var password, database;
var parsed_url  = url.parse(process.env.REDISTOGO_URL || 'redis://localhost:6379');
var parsed_auth = (parsed_url.auth || '').split(':');
var options = querystring.parse(parsed_url.query);

var client = require('redis').createClient(parsed_url.port, parsed_url.hostname, options);

if (password = parsed_auth[1]) {
  client.auth(password, function(err) {
    if (err) throw err;
  });
}

Promise.promisifyAll(client);

module.exports = client;
