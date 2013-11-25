var client = require("./redisClient");


module.exports = {
  createUser: function(raw) {
    
     var userId;

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
           client.setAsync("username.to.id:" + raw.username.toLowerCase(), userId);
        }).then(function(){
            return client.hmgetAsync('user:'+userId, 'username', 'email');
        });
  },

  checkLogin: function(raw) {
    if (!raw.username || !raw.password) {
      throw new UserException(1, "Username and password are two required fields.");
    }

    // TODO: to be implemented
    return client.hgetAsync('users:1');
  },

  lookupUser: function(id) {
    return client.hmgetAsync("user:" + id, 'username');
  },
}

function UserException(value, msg) {
  this.value = value;
  this.message = msg;
  this.toString = function() {
     return this.value + this.message
  };
}
