var client = require("./redisClient");
var NodePbkdf2 = require('node-pbkdf2');
var RandBytes = require('randbytes');
var Promise = require("bluebird");
var _ = require('underscore');

config = {
  PBKDF2Iterations: 1000,
  UserInitialKarma: 100
}


module.exports = {
  createUser: function(raw) {

    var userId,
        username,
        authToken,
        that = this;

    var salt, apisecret;

     if (!raw.username || !raw.password) {
       throw new UserException(2, "Credentials are needed");
     }

     return client.incrAsync('users.count')
     .then(function(id) {
       userId = id;
       username = raw.username.toLowerCase();
       get_rand().then(function(bytes) {
         salt = bytes;
         return get_rand();
       }) 
       .then(function(bytes) {
         apisecret = bytes;
         return get_rand();
       })
       .then(function(bytes) {
         auth_token = bytes;
       })
       .then(function() {
         return hashPassword(raw.password, salt);
       })
       .then(function(password) {
         return client.hmsetAsync(
             "user:" + id,
             "username", username,
             "password", password,
             "salt", salt,
             "ctime", get_time(),
             "karma", config.UserInitialKarma,
             "about", "",
             "email", "",
             "auth", auth_token,
             "apisecret", apisecret,
             "flags", "",
             "karma_incr_time", get_time(),
             "flags", userId === 1 ? "a" : ""
           );
         })
         .then(function() {
           return client.setAsync('username.to.id:' + username, userId);
         })
         .then(function() {
           return client.setAsync('auth:' + auth_token, userId);
         })
         .then(function() {
           console.log(auth_token);
           return auth_token;
         })
         .catch(function(err) {
           console.log(err);
         });
       });
  },

  checkLogin: function(raw) {
    var that = this;
    console.log("[checkLogin] - " + raw.password);
    return this.lookupUserID(raw.username)
      .then(function(id) {
        if (id === null) { throw new Error("No match for the specified username / password pair."
) };
        return that.checkUserCredentials(id, raw.password);
      })
  },

  checkUserCredentials: function(id, password) {
    var user;

    return this.lookupUserByID(id)
      .then(function(userFound) {
        user = userFound;
        return checkPassword(password, user);
      })
      .then(function(passwordMatch) {
        if (passwordMatch) {
          console.log("[credentials match] " + user.username);
          return [user.auth, user.apisecret];
        }
        else
        {
          throw Error("No match.");
        }
      });
  },

  lookupUserByID: function(id) {
    return client.hgetallAsync("user:" + id)
  },

  lookupUserID: function(username) {
    return client.getAsync("username.to.id:" + username.toLowerCase());
  },
}

function UserException(msg) {
  this.message = msg;
  this.toString = function() {
     return this.value + this.message
  };
}

// Turn the password into an hashed one, using PBKDF2 with HMAC-SHA1
// and 160 bit output.
function hashPassword(pw, salt) {
  var hasher = new NodePbkdf2({ 
    iterations: config.PBKDF2Iterations, 
    salt: salt,
    keyLength: 160/8
  });
  console.log("encrypt");
  var dfd = Promise.defer();
  hasher.encryptPassword(pw, function(err, encryptedPassword) {
    console.log(encryptedPassword);
    dfd.resolve(encryptedPassword);
  });
  return dfd.promise;
}

function checkPassword(pw, user) {
  var hasher = new NodePbkdf2({ 
    iterations: config.PBKDF2Iterations, 
    salt: user.salt,
    keyLength: 160/8
  });
  var dfd = Promise.defer();
  hasher.checkPassword(pw, user.password, function(err, ok) {
    console.log("ok");
    dfd.resolve(ok);
  });
  return dfd.promise;
}

function get_time() {
  return (new Date).getTime();
}

var randomSource = RandBytes.urandom.getInstance();

function get_rand() {
  var dfd = Promise.defer();
  randomSource.getRandomBytes(20, function(bytes) {
    dfd.resolve( bytes.toString('hex') ); // convert to hex string
  });
  return dfd.promise;
}


UserException.prototype = Error.prototype;
