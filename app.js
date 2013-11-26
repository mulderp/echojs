
/**
 * Module dependencies.
 */

var express = require('express')
    news = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');

var app = express();

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

app.get('/', news.index);
app.get('/submit', news.submit);
app.get('/latest', news.latest);

app.get('/login', user.showLogin);
app.get('/api/login', user.login);
app.post('/api/create_account', user.create_account);
app.post('/api/reset-password', user.reset_password);
app.post('/api/submit', news.submit_post);
app.post('/api/delnews', news.delete_post);
app.post('/api/postcomment', news.post_comment);
app.post('/api/updateprofile', news.updateprofile);
app.post('/api/votecomment', news.votecomment);
app.get('/api/getnews/:sort/:start/:count', news.sortnews);
app.get('/api/getcomments/:news_id', news.getcomments);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
