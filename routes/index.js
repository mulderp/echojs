
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('main', { title: 'EchoJS', layout2: 'layout' });
};
