var client = require("./redisClient");

config = {
  UserInitialKarma: 100
}


module.exports = {
  createUser: function(raw) {

    var userId,
        username,
        authToken,
        that = this;

     if (!raw.username || !raw.password) {
       throw new UserException(2, "Credentials are needed");
     }

     return client.incrAsync('users.count').then(function(id){
        userId = id;
        username = raw.username.toLowerCase();
        auth_token = get_rand();
        var salt = get_rand();

        return client.hmsetAsync(
              "user:" + id,
              "username", username,
              "password", hash_password(raw.password, salt),
              "salt", salt,
              "ctime", get_time(),
              "karma", config.UserInitialKarma,
              "about", "",
              "email", "",
              "auth", auth_token,
              "apisecret", get_rand(),
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
          return auth_token;
        })
  },

  checkLogin: function(raw) {
    var that = this;
    return this.lookupUserID(raw.username)
      .then(function(id) {
        if (id === null) { throw new Error("No match for the specified username / password pair."
) };
        return that.checkUserCredentials(id, raw.password);
      })
  },

  checkUserCredentials: function(id, password) {
    return this.lookupUserByID(id)
      .then(function(user) {
        if (true) { //user.password === hash_password(password, user.salt)) {
          return [user.auth, user.apisecret];
        }
        else
        {
          return null;
        }
      });
  },

  lookupUserByID: function(id) {
    var that = this;
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
function hash_password(hash, salt) {
  // p = PBKDF2.new do |p|
  //     p.iterations = PBKDF2Iterations
  //     p.password = password
  //     p.salt = salt
  //     p.key_length = 160/8
  // end
  // p.hex_string
}

function get_time() {
  return 123;
}

function get_rand() {
  return 123;
}


UserException.prototype = Error.prototype;
