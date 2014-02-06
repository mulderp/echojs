
/*
 * GET users
 */

var users = require('../api/users');

exports.showLogin = function(req, res){
  res.set('Content-Type', 'text/html');
  res.render('login', { title: 'EchoJS - test', auth: null });
};

exports.login = function(req, res){
  res.set('Content-Type', 'application/json');

  if (!req.query.username || !req.query.password) {
    res.send({status: 'err', error: "Username and password are two required fields."});
    return
  }

  users.checkLogin(req.query)
    .then(function(data) {
      res.send({status: 'ok', auth: data[0], apisecret: data[1] });
    })
    .catch(function(err) {
      res.send({status: 'err', error: err.toString()});
    });
};


exports.create_account = function(req, res){
  res.set('Content-Type', 'application/json');
  users.createUser(req.body)
    .then(function(data) {
       res.send({status: 'ok', auth: data});
     })
     .catch(function(err) {
       console.log(err);
       res.send({status: 'err', error: err});
     });
};

exports.reset_password = function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send("not implemented yet");
}

exports.updateprofile = function(req, res) {
  res.send("not implemented");
}

