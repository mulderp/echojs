var client = require("./redisClient");


module.exports = {
  createUser: function(raw) {
    
     var userId, that = this;

     if (!raw.username || !raw.password) {
       throw new UserException(2, "Credentials are needed");
     }
    
     return client.incrAsync('users.count').then(function(id){
        userId = id;
        return client.hmsetAsync(
              'user:' + id,
              'username', raw.username,
              'password', raw.password
          );
        }).then(function(){
            return client.hmgetAsync('user:'+userId, 'username', 'email');
        });
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

  userAsJSON: function(data) {
    console.log(data);
    return {
      id:       data[0],
      username: data[1],
      salt:     data[2],
      password: data[3],
      ctime:    data[4],
      karma:    data[5],
      about:    data[6],
      email:    data[7],
      auth:     data[8],
      apisecret: data[9],
      flags:     data[10],
      karma_incr_time: data[11]
    }
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


UserException.prototype = Error.prototype;
