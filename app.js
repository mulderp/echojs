
/**
 * Module dependencies.
 */

var express = require('express')
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');

var app = express();


// redis
var url = require('url');
var querystring = require('querystring');
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

var crypto = require('crypto');
var Promise = require("bluebird");

// deal with asynchronous redisClient
Promise.promisifyAll(client);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// config
var SiteName = "EchoJS - test";

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
