
/*
 * GET news
 */

var news = require('../api/news');

exports.news = function(req, res){
  console.log(req.session);
  news.getTop().then(function(news) {
    console.log(news);
    res.render('main', { title: 'EchoJS - test', news: news });
  })
  .catch(function(err) {
    console.log(err)
  });
};

exports.submit = function(req, res){
  res.render('submit', { title: 'EchoJS - test', SiteUrl: 'localhost', t: '', u: ''});
};

exports.latest = function(req, res){
  res.render('main', { title: 'EchoJS - test', news: [] });
};

exports.submit_post = function(req, res) {
  res.send({status: 'err', error: "not yet implemented"});
}

exports.delete_post = function(req, res) {
  res.send({status: 'err', error: "not yet implemented"});
}

exports.post_comment = function(req, res) {
  res.send({status: 'err', error: "not yet implemented"});
}

exports.votecomment = function(req, res) {
  res.send("not implemented");
}

exports.sortnews = function(req, res) {
  res.send("not implemented");
}

exports.getcomments = function(req, res) {
  res.send("not implemented");
}
