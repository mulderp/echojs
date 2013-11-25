
/*
 * GET users listing.
 */

var users = require('../api/users');

exports.login = function(req, res){
  res.render('login', { title: 'EchoJS - test' });
};

exports.register = function(req, res){
  users.createUser(req.body)
    .then(function(data) {
       res.send('ok');
     })
     .catch(function(err) {
       res.send(err);
     });
};
