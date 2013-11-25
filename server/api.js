var restify = require('restify');
var news = require('./news.js');

var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

// redis
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

var server = restify.createServer({ name: 'jsnews' });
var crypto = require('crypto');

var Promise = require("bluebird");

// deal with asynchronous redisClient
Promise.promisifyAll(client);


// setup server
server
  .use(restify.fullResponse())
  .use(restify.bodyParser())


function addVotes(m, data) {
  console.log(data);
  var rawMovie = m;
  if (data != undefined) {
  rawMovie["vote_url"] = "/news/" + data[0];
  }
  rawMovie["genres"] = rawMovie["genres"] ? rawMovie["genres"].split(",") : [];
  return rawMovie;
}

server.get('/news', function (req, res, next) {
  console.log("GET /news/top");
    return news.allnews()
      .then(function(m) { res.send(m); })
      .catch(function(err) { res.send(500, err) });
});

server.put('/news/:id', function (req, res, next) {
  console.log("PUT /news/" + req.params.id);
  console.log(req.body);
     var voter = 1;
     var vote = req.body.vote;
     return news.votesExists(req.params.id, voter)
         .then(function(result) {
           return news.addVote(vote, req.params.id, voter)
         })
         .then(function() {
            return news.computeScore(req.params.id)
         .then(function(score) {
            return news.updateScore(req.params.id, score);
         })
         .then(function() {
           return news.getMovie(req.params.id);
         })
         .then(function(data) {
           return news.movieToJSON(data); 
         })
         .then(function(result) {
           console.log("result: ");
           console.log(result);
           res.send(200, result);
         })
     })
     .catch(function(err) {
       res.send(500, err);
     });
});



function now() {
  return new Date().getTime();
}


server.post('/news/like', function(req, res, next) {
  console.log(req.body);
  news.voteUp(req.body.id, req.body.user_id)
  .then(function(m) { console.log(m); res.send(m); })
  .catch(function(err) { console.log(err); res.send(500, err) });
});

server.get('/genres/all', function (req, res, next) {
  news.allGenres().
    then(function(genres) { res.send(genres); });
})


// auth
function createUser(raw, success_cb, fail_cb) {

 var userId;

 client.incrAsync('users.count').then(function(id){
    userId = id;
    return client.hmsetAsync(
          'user:' + id,
          'id', id,
          'username', raw.username,
          'password', raw.password,
          'email', raw.email
      );
    }).then(function() {
       client.setAsync("username.to.id:" + raw.username.toLowerCase(), userId);
    }).then(function(){
        return client.hmgetAsync('user:'+userId, 'username', 'email');
    }).then(function(data) {
      success_cb(userId, data);
    }).catch(function(err){
      fail_cb(err);
    });
}


server.post('/auth/create_user', function(req, res, next) {
  function success(userId, data) {
      console.log("user created: " + data);
      res.send({id: userId, username: data[0], email: data[1]});
  };
  function fail(err) {
      res.send('500', { error: err });
      res.writeHead(500);
      res.end();
      console.log(err);
      return;
  }
  createUser(req.body, success, fail);
})

function checkAuth(res, req) {
  var cookies = get_cookies(req);

  return client.getAsync('auth:' + cookies.session).then(function(id) {
    console.log("user: " + id);
    if (id == null) {
      throw "No Session"
    }
    return client.hmgetAsync('user:'+id, 'id', 'username', 'email');
  })
}

// return 200 and user if session is found
//
server.get('/auth/session', function(req, res, next) {
  console.log("GET /auth/session ");
  checkAuth(res, req).then(function(data) {
    console.log("/auth/session success");
    console.log(data);
    res.send({auth: 'OK', id: data[0], username: data[1], email: data[2]});  
    res.end();
    return
  }).catch(function(err) {
      res.send('500', { error: err });
      res.end();
      console.log(err);
      return
  });
});

server.del('/auth/session', function(req, res, next) {
  console.log("*** logout");
  var cookies = get_cookies(req);
  client.delAsync("auth:" + cookies.session).then(function() {
    res.send(200, {auth: 'nok'});
  }).catch(function(err) {
    console.log(err);
    res.send("500", {error: err});
  });

});

function lookupUserId(username, cb, fail_cb) {
  client.getAsync("username.to.id:" + username.toLowerCase())
    .then(function(id) {
      userId = id;
      return client.hmgetAsync('user:' + id, 'username', 'email', 'password');
    }).then(function(data) {
       cb(userId, data[0], data[1], data[2]);
    }).catch(function(err) {
      fail_cb(err); 
    });
}

function get_rand() {
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  return crypto.createHash('sha1').update(current_date + random).digest('hex');
}

server.post('/auth/session', function(req, res, next) {
  console.log("POST /auth/session ****");
  var userId;
  var raw = req.body;
  console.log(raw);
  console.log(raw.username);
  var key = get_rand();
  lookupUserId(raw.username, function(userId, username, email, password) {
    if (userId !== null && raw.password === password) {
      client.set("auth:" + key, userId);
      res.header('Set-Cookie', 'session=' + key + '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/; HttpOnly');    
      res.send({auth: 'OK', id: userId, username: username, email: email}); 
    } else {
      res.send(401, {auth: 'NOK', error: "username not found"});
    }
  }, function(err) {
    res.send(401, {auth: 'NOK'});
    console.log("/auth/session: %", err);
    return;
  });

});

server.get('/auth/ping', function(req, res, next) {
  console.log("***** " + req);
  console.log(req.headers);
  res.send("pong");
});

server.post('/auth/user', function(req, res, next) {
  res.send({auth: "my_secret_token2"});
});

//serve static content
server.get(/\/.*/, restify.serveStatic({
    directory: './public',
    default: 'index.html'
}));
 
var port = process.env.PORT || 5000;
server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url)
})

//  var userId;
//
//
//  async.waterfall([
//    function(cb) {
//      // Increase
//      client.hincrby('users', 'count', 1, cb);
//    },
//    function(id, cb) {
//      // Higher Scope a userId variable for access later.
//      userId = id;
//      console.log(userId);
//      // Set
//      client.hmset('user:'+id, 
//        'username', raw.username, 
//        'password', raw.password, 
//        'email', raw.email, 
//        cb);
//    },
//    function(write, cb) {
//      client.hmget('user:'+userId, 'username', 'email', cb);
//    }
//  ], function(err,read){
//      if (err) {
//        fail_cb(err);
//      }
//      success_cb(userId, read);
//  })
//

// ***** helpers
var get_cookies = function(request) {
  var cookies = {};
  request.headers && request.headers.cookie && request.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};
