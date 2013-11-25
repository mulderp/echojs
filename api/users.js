var client = require("./redisClient");


module.exports = {
  createUser: function(raw, success_cb, fail_cb) {
    
     var userId;
    
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
    }
}
