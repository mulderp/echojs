
/*
 * GET news
 */

var news = require('../api/news');

exports.index = function(req, res){
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
  res.send("not implemented");
}

exports.delete_post = function(req, res) {
  res.send("not implemented");
}

exports.post_comment = function(req, res) {
  res.send("not implemented");
}

exports.updateprofile = function(req, res) {
  res.send("not implemented");
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
