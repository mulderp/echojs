var client = require("./redisClient");

module.exports = {
  getNewsItem: function(id) {
     return client.hgetallAsync("news:" + id)
  },
  newsItemToJSON: function(data) {
    console.log(data);
     return {
           id:       data[0],
           title:    data[1],
           url:      data[2],
           user_id:  data[3],
           ctime:    data[4],
           score:    data[5],
           rank:     data[6],
           down:     0,
           comments: 0
         };
  },
  getTop: function() {
    var that = this;
    return client.zrevrangeAsync('news.top', 0, -1)
      .map(function(id) {
             return that.getNewsItem(id)
      });
  },
  addVote: function(vote, news_id, user) {
    return client.zaddAsync("news.vote."+vote + ":" + news_id, now(), user).then(function() {
      return client.hincrbyAsync("news:" + news_id, "rating", vote);
    });
  },
  votesExists: function(news_id, user) {
    var that = this;
    return Promise.all(_.map([1,2,3,4,5], function(vote) {
      return client.zscoreAsync("news.vote." + vote + ":" + news_id, user)
        .then(function(score) {
          if (score != null) {
            return that.deleteVote(vote, news_id, user);
          }
          })
      }))
  },

  // use number of votes per rating as base for calculations
  computeScore: function(news_id) {
    var totalScore = 0;
    var totalVotes = 0;
    var i = 0;
    return Promise.all(_.map([1,2,3,4,5], function(vote) {
      return client.zrangeAsync("news.vote." + vote + ":" + news_id, 0, -1, "withscores")
        .then(function(votes_1) {
          return votes_1;
        });
      }))
      .map(function(score) {
        i += 1;
        if (score[0] != undefined) {
          totalVotes += 1;
        }
        return (score[0] != undefined) ? totalScore += i * score.length/2 : totalScore;
      }).then(function(score) {
        return score[4]/totalVotes;
      });
  },

  // deleting a vote means removing the score from the set, as well as subtracting from the score
  deleteVote: function(vote, news_id, user) {
    return client.zremAsync("news.vote."+ vote + ":" + news_id, user).then(function() {
      return client.hincrbyAsync("news:" + news_id, "rating", vote * -1);
    });
  },

  // update votes
  updateScore: function(news_id, score) {
    return client.zaddAsync("news.top", score, news_id)
      .then(function() {
        return client.zrevrankAsync("news.top", news_id)
      })
      .then(function(rank) {
        console.log("new score: " + score);
        console.log("new rank: " + rank);
        return client.hmsetAsync("news:" + news_id, "score", score, "rank", rank)
      });
  },

  lookupUser: function(id) {
    return client.hmgetAsync("user:" + id, 'username');
  },
  lookupNewsItem: function(id) {
    return client.hmgetAsync("news:" + id, 'title');
  }
}



function rand(seed) {
  return Math.floor(Math.random()*seed);
}

function rand_time(seed_time, range) {
  return seed_time + rand(range);
}

function rand_rating() {
  return (1 + rand(4));
}

Time = {};
Time.now = 123123;

news = [ 
];


