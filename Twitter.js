//import package libraries
var Twit = require('twit');
var config = require('./config');
var XMLHttpRequest = require('xhr2');
var fs = require ('fs');

// need to authenicate with OAuth
// access token/secret needed for app scenarios for authenticating to
// other user accounts

/* Three general ways to connect to Twitter API:
	- get requests (search: by hashtag, location or users)
	- post requests (create tweets)
	- stream requests (continuous socket-like connection
	  where you can assign events to the stream-- @mentions!)
*/

var T = new Twit(config);
var HttpClient = function() {
    this.get = function(url, callback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                callback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", url, true );
        anHttpRequest.send( null );
    }
}

streamIt();
// User stream - get an event for certain kinds of actions - follows,
// tweets to you, @mentions to you
// public stream - for events gaged towards the public - hashtags as ex.
function streamIt () {
	var stream = T.stream('user');
	stream.on('tweet',tweetEvent);

	// event callback to handle tweets sent in reply to account
	function tweetEvent(eventMsg) {
		var json = JSON.stringify(eventMsg,null,2);

		var replyTo = eventMsg.in_reply_to_screen_name;
		var text = eventMsg.text;
		var id_str = eventMsg.id_str;
		var mentions = eventMsg.entities.user_mentions[0].screen_name;
		var from = eventMsg.user.screen_name;

		AddTweetToSite (from, id_str);

		// if the return tweets are always the same, an error will be thrown by
		// Twitter MakeTwitError
		if (from === 'IloveAnimals' || from === 'ILoveAn94419577') {
			var newTweet = '@' + from + ' , random user ' + Math.floor(Math.random() * 100)+
			' thank you for communicating with me!';
			tweetIt(newTweet);
		}
	}
}

function tweetIt (txt) {
	var tweet = {
 		status: txt
 	};
	//T.post (path, [params], callback)
 	T.post('statuses/update',tweet,tweeted);
}

function AddTweetToSite (from, id_str) {
	embed = " "
	ref1 = "<script type=\"text/javascript\" src=\"http:\/\/platform.twitter.com/widgets.js\"></script>";
	ref2 = "<blockquote class=\"twitter-tweet\"><a href=\"http:\/\/twitter.com\/"
	 			 + from + "\/status\/" + id_str + "\">link</a></blockquote>";
	embed = ref1 + ref2;
	fs.appendFile('index.html',embed, (err) => {
    if (err) throw err;
		console.log (err);
	});
}

function gatherURL(id_str) {
	var urlPrefix = 'https%3A%2F%2Ftwitter.com%2FInterior%2Fstatus%2F';
	var reqStart = 'https://publish.twitter.com/oembed?url=';
	var fullURL = reqStart + urlPrefix + id_str;
	var client = new HttpClient();
	client.get(fullURL, function(response) {
			var json = JSON.stringify(response,null,2);
			return json;
	});
}

function getTweets () {
	// q includes names of other users (anything that comes up in msg text)
	var params = {
		q: 'WB_ORG',
		count: 100
	};
	// T.get (path, [params], callback)
	T.get('search/tweets',params,gotData );
}

// callback function for posting
function tweeted (err,data,response) {
	if (err) {
		console.log(err);
	}
}

// callback function for getting -to be triggered when there is
// data to handoff from the API (like a jQuery AJAX call)
function gotData(err,data,response) {
	var tweets = data.statuses;
	for (var i=0; i<tweets.length; i++) {
		console.log(tweets[i].text);
	}
}
