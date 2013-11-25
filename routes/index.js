
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
  res.send('submit - todo');
};

exports.latest = function(req, res){
  res.render('latest - todo');
};
