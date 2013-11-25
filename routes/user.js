
/*
 * GET users
 */

var users = require('../api/users');

exports.login = function(req, res){
  res.set('Content-Type', 'text/html');
  res.render('login', { title: 'EchoJS - test' });
};

exports.register = function(req, res){
  res.set('Content-Type', 'application/json');
  users.createUser(req.body)
    .then(function(data) {
       res.send({status: 'ok', auth: data});
     })
     .catch(function(err) {
       res.send({status: 'err', error: err});
     });
};

exports.reset_password = function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send("not implemented yet");
}
