
/*
 * GET news
 */

var news = require('../api/news');
var cookieParser = require('../api/cookieParser');

exports.news = function(req, res){
  console.log(req.session);
  var cookies = cookieParser(req);
  console.log(cookies.auth);
  var auth;
  cookies && cookies.auth ? auth = cookies.auth : auth = null;

  news.getTop().then(function(news) {
    console.log(news);
    res.render('main', { title: 'EchoJS - test', news: news, auth: auth });
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
  res.set('Content-Type', 'application/json');
  res.send({status: 'err', error: "not yet implemented"});
}

exports.delete_post = function(req, res) {
  res.set('Content-Type', 'application/json');
  if (!user) {
    res.send({status:"err", error:"Not authenticated."})
    return
  }

  if (!check_api_secret) {
     res.send({status:"err", error:"Wrong form secret."});
  }

  // We can have an empty url or an empty first comment, but not both.
  if (!check_params("title", "news_id", url, text) ||
                             (req.params.url.length == 0 &&
                              req.params.text.length == 0))
  {
      res.send({status: "err", error: "Please specify a news title and address or text."})
  }

  // Make sure the URL is about an acceptable protocol, that is
  // http:// or https:// for now.
  if (req.params.url.length != 0) {
      if (params.url.index("http://") != 0 &&
         params.url.index("https://") != 0) {
          return {
            status: "err",
            error: "We only accept http:// and https:// news."
          }
        }
  }

  if (req.params.news_id.to_i == -1) {
      if (submitted_recently) {
          return {
            status: "err",
            error: "You have submitted a story too recently, "+
              "please wait #{allowed_to_post_in_seconds} seconds."
          }
        }
      news_id = insert_news(params.title, params.url, params.text, user.id)
  }
  else
  {
      news_id = edit_news(params.news_id, params.title, params.url, params.text, user.id)
      if (!news_id) {
          return {
            status: "err",
               error: "Invalid parameters, news too old to be modified "+
                        "or url recently posted."
          }
        }
  }
  return  {
    status: "ok",
    news_id: news_id.to_i
  }

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

exports.about = function(req, res) {
  res.send("not implemented");
}
