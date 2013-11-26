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
        }).then(function() {
          return that.lookupUserByUsername(raw.username);
        }).then(function(){
            return client.hmgetAsync('user:'+userId, 'username', 'email');
        });
  },

  checkLogin: function(raw) {
    var that = this;
    return this.lookupUserByUsername(raw.username)
      .then(function(id) {
        if (id === null) { throw new Error("no user") };
        return that.lookupUserByID(id);
      })
  },

  lookupUserByID: function(id) {
    return client.hgetallAsync("user:" + id)
      .then(function(data) {
        console.log(data);
//     hp = hash_password(password,user['salt'])
//     (user['password'] == hp) ? [user['auth'],user['apisecret']] : nil
       return "ok"; 
      });
  },

  lookupUserByUsername: function(username) {
    return client.getAsync("username.to.id:" + username.toLowerCase());
  },
}

function UserException(msg) {
  this.message = msg;
  this.toString = function() {
     return this.value + this.message
  };
}
UserException.prototype = Error.prototype;
