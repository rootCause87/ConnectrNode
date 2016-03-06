var http = require('http');
var https = require('https');
var fs = require('fs');
var wstream = fs.createWriteStream('output.json');
var wstreamImg = fs.createWriteStream('outputImg.json');
var content;
var jsonResult;
var topic = 'NBCUniversal';

https.get('https://search-proxy.spredfast.com/search.json?q=' + topic + '&filter.start=-1h&filter.finish=0&view.entities.limit=20', function (res) {
    res.pipe(wstream);

    wstream.on('finish', function() {
      fs.readFile('output.json', 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data);
        console.log('got', obj.views.entities.data.length, 'tweets about', topic, "in the past hour.");
        var myFive = topFive(obj.views.entities.data);
        myFive.forEach(function(tweet,i) {
          console.log('Tweet',i,tweet.raw.text, tweet.raw.retweet_count);
        });
      });
    });
});

https.get('https://search-proxy.spredfast.com/search.json?q=' + topic + '&filter.start=-1d&filter.finish=0&view.entities.limit=20&filter.has_image=true', function (res) {
    res.pipe(wstreamImg);

    wstreamImg.on('finish', function() {
      fs.readFile('outputImg.json', 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data);
        var myImage = topFive(obj.views.entities.data)[0];
        console.log('The top image related to ' + topic + ' from the past 24 hours got ' + myImage.raw.retweet_count + ' retweets, and was posted by' + myImage.raw.user.screen_name);
        console.log('Image url:', myImage.raw.entities.media[0].media_url);
      });
    });
});

function topFive(tweets) {
  var arr = [];

  tweets.forEach(function(tweet) {
    if(arr.length < 5) {
      arr.push(tweet);
    }
    else if(tweet.raw.retweet_count < arr[4].raw.retweet_count) {
      arr.splice(4,1);
      arr.push(tweet);
    }
    arr.sort(function(a,b) {
      return +b.raw.retweet_count - +a.raw.retweet_count;
    });
  });
  return arr;
}