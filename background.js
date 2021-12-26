//browser.browserAction.onClicked.addListener(click);
browser.alarms.create({periodInMinutes: 1});
var appClientID = "tn2qigcd7zaj1ivt1xbhw0fl2y99c4y";
var OAuthState = getOAuthState();
var OAuthAccessToken = '';
var defaultpage = "https://twitch.tv/";

function addToStorage(channel, type, callback){
	// Type = 0 Follow
	// Type = 1 Unfollow
	// Type = 2 Enable Single Notifications
	// Type = 3 Disable Single Notifications
	var streamers;
	browser.storage.local.get({streamers:{}, 'notifications':true}, function (result) {
		streamers = result.streamers;
		if (type == 1){
			delete streamers[channel];
		}
		else if (type == 0)
			streamers[channel] = {flag:0,url:"null",game:"null",viewers:-1,created_at:"null",title:"null",notify:result.notifications};
		else if (type == 2)
			streamers[channel].notify=true
		else if (type == 3)
			streamers[channel].notify=false
		browser.storage.local.set({'streamers': streamers}, function () {
			var opt;
			if (type == 1){
				opt = {
				  type: "basic",
				  title: "NowStreaming",
				  message: "You unfollowed "+channel+"!",
				  iconUrl: "cross.png"
				}
			}
			else if (type == 0){
				opt = {
				  type: "basic",
				  title: "NowStreaming",
				  message: "You are now following "+channel+"!",
				  iconUrl: "check.png"
				}
			}
			if(result.notifications && type < 2){
				browser.notifications.clear((type==1?"un":"") + "follow"+channel+"-nstreaming", function(wasCleared) {});
				browser.notifications.create((type==1?"un":"") + "follow"+channel+"-nstreaming", opt, function(id) {updateCore(0,function(){callback();}); });
			}
			else{
				updateCore(0,function(){callback();});
			}
		});
	});
}

function isEmpty(map) {
   for(var key in map) {
      if (map.hasOwnProperty(key)) {
         return false;
      }
   }
   return true;
}

// Listener used to communicate with the popup
// request.type == 0: Calls updatecore using request.is_first_run
// request.type == 1: Calls addToStorage using request.channel and request.subType
// request.type == 3: Calls initiateOAuth
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.type) {
            case 0:
                // updateCore
                updateCore(request.is_first_run, sendResponse)
                break;
            case 1:
                // addToStorage
                addToStorage(request.channel, request.subType, sendResponse)
                break;
            case 3:
                // initiateOAuth
                initiateOAuth();
                sendResponse();
                break;
        }
        return true;
    }
);

browser.runtime.onStartup.addListener(function() {
	browser.storage.local.get({streamers:{}, 'notifications':true}, function (result) {
		streamers = result.streamers;
		for (var key in streamers){
			if (streamers[key].notify == null) {
				streamers[key] = {
					flag: 1,
					game: "null",
					viewers: -1,
					url: "null",
					created_at: "null",
					title: "null",
					notify: result.notifications
				};
			} else{
				streamers[key] = {
					flag: 1,
					game: "null",
					viewers: -1,
					url: "null",
					created_at: "null",
					title: "null",
					notify: streamers[key].notify
				};
			}
		}
		browser.storage.local.set({'streamers': streamers}, function () {
			updateCore(1,function(){});
		});
	});
});

browser.runtime.onUpdateAvailable.addListener(function (){
	browser.runtime.reload();
});

browser.runtime.onInstalled.addListener(function () {
	browser.storage.local.get({streamers:{},'notifications':true,'add':true}, function (result) {
		streamers = result.streamers;
		for (var key in streamers){
			if (streamers[key].notify == null) {
				streamers[key] = {
					flag: 1,
					game: "null",
					viewers: -1,
					url: "null",
					created_at: "null",
					title: "null",
					notify: result.notifications
				};
			} else{
				streamers[key] = {
					flag: 1,
					game: "null",
					viewers: -1,
					url: "null",
					created_at: "null",
					title: "null",
					notify: streamers[key].notify
				};
			}
		}
		browser.storage.local.set({'streamers': streamers,'notifications':result.notifications,'add':result.add}, function () {
			updateCore(1,function(){});
		});
	});
});

browser.notifications.onClicked.addListener(function(notificationId) {
	if (notificationId.split("-")[1] != "nstreaming"){
		browser.tabs.create({url: notificationId.split('-')[1]});
	}
});

browser.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
	if (btnIdx === 0) {
		addToStorage(notifId.split('-')[0],1,function(){});
	}
});

browser.alarms.onAlarm.addListener(function() {
	updateCore(0,function(){});
});

function getFollowing(){
	browser.storage.local.get({streamers:{}}, function (result) {
		streamers = result.streamers;
	});
}

function initiateOAuth(){
    authorize(true).then(extractAndSaveOAuthAccessToken).then(function(){
        updateCore(1,function(){});
	});
}

function setOAuthAccessToken(token) {
    OAuthAccessToken = token;
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function getOAuthState() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 50; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function extractAndSaveOAuthAccessToken(response_url){
    url_parameters = new URL(response_url.replace('#', '?')).searchParams;
    if (url_parameters.get('state') === OAuthState ) {
        browser.storage.local.set({access_token: url_parameters.get('access_token')});
        return url_parameters.get('access_token');
    }
}

function authorize(prompt) {
    var oauth_url = 'https://id.twitch.tv/oauth2/authorize?client_id=' + appClientID + '&redirect_uri=' + browser.identity.getRedirectURL() + '&response_type=token&force_verify='+prompt+'&state='+OAuthState;
    return browser.identity.launchWebAuthFlow({url: oauth_url, interactive: true});
}

async function validateOAuthAccessToken(token){
	var url = "https://id.twitch.tv/oauth2/validate"
	const response = await fetch(url, {
		headers: {
			'Client-ID': appClientID,
			'Authorization': 'Bearer '+token
		},
		dataType: "json",
		type: 'GET'
	});
	return response.json();
}

async function twitchAPIBackgroundCall(type, channels){
	switch(type){
		case 0:
			// User to IDs
			var url = "https://api.twitch.tv/helix/users/?login="+channels.replaceAll(',','&login=');
			break;
		case 1:
			// Get streams
			var url = "https://api.twitch.tv/helix/streams?user_login="+channels.replaceAll(',','&user_login=');
	}
    const response = await fetch(url, {
        headers: {
            'Client-ID': appClientID,
            'Authorization': 'Bearer '+OAuthAccessToken
        },
        dataType: "json",
        type: 'GET'
    });
	return response.json();
}
/* This was needed when Twitch forced the API to accept IDs only instead of usernames
function getUserIDBatch(result){
	ids = []
	for (var i in result.data){
		ids.push(result.data[i].id);
	}
	return ids;
}*/

function updateCore(is_first_run,callback) {
    browser.storage.local.get({access_token:''}, function (result) {
        validateOAuthAccessToken(result.access_token).then(json => {
            if (json.status == 401) {
                browser.storage.local.set({access_token: ''});
                return;
            }

            setOAuthAccessToken(result.access_token);
            var streamers = {};
            temp = [];

			/*Load streamers*/
			browser.storage.local.get({streamers:{},'notifications':true}, function (result) {
				streamers = result.streamers;

				/* Not following anyone? Don't do anything */

				if (isEmpty(streamers)){
					browser.browserAction.setBadgeText({"text": ""});
					callback();
					return;
				}

                /* This was needed when Twitch forced the API to accept IDs only instead of usernames
                var urlAppend="";
                var idsArray=[];
                var processedCalls=0;
                var totalCalls = Math.ceil(streamersArray.length/100);
				streamersArray.forEach(function(listItem, index){
					urlAppend+=listItem+",";
					if ( (index != 0 && index % 99 == 0) || index == streamersArray.length - 1){
						twitchAPIBackgroundCall(0, urlAppend.slice(0,-1)).done(function (json) {
							idsArray = $.merge(idsArray, getUserIDBatch(json));
							processedCalls++;
							if (totalCalls == processedCalls){
								getStreams();
							}
						});
						urlAppend = "";
					}
				});*/

                var streamersArray=Object.keys(streamers);
                getStreams();

				function getStreams(){
					var urlAppend="";
					var onlineStreams = 0;
					for (var i = 0; i < streamersArray.length; i++) {
						urlAppend += streamersArray[i] + ",";
						if ( (i != 0 && i % 99 == 0) || i == streamersArray.length - 1) {
							twitchAPIBackgroundCall(1, urlAppend.slice(0, -1)).then(json => {
								/* If anyone is streaming then this loop will run */
								for (i = 0; i < json.data.length; i++) {
									/* We will need this temp so we can check which streamers are NOT streaming in the end */
									temp.push(json.data[i].user_login);
									onlineStreams++;
									/* If stream is up and notification has not been sent, then send it */
									if (result.notifications && !is_first_run && streamers[json.data[i].user_login].flag == 0 && (streamers[json.data[i].user_login].created_at != json.data[i].started_at) && streamers[json.data[i].user_login].notify) {
										tmpname = json.data[i].user_login;
										tmpurl = defaultpage+json.data[i].user_login;
                                        var opt = {
                                            type: "basic",
                                            title: "Live: " + json.data[i].user_name,
                                            message: "Game: " + (json.data[i].game_name != null ? json.data[i].game_name : "N/A") + "\n" + "Viewers: " + json.data[i].viewer_count,
                                            contextMessage: "Click to watch the stream",
                                            isClickable: true
                                        }
										twitchAPIBackgroundCall(0, tmpname).then(data => {
                                            opt.iconUrl = data.data[0].profile_image_url != null ? data.data[0].profile_image_url : "icon.png";
                                            browser.notifications.clear(tmpname + "-" + tmpurl, function (wasCleared) {
                                            });
                                            browser.notifications.create(tmpname + "-" + tmpurl, opt, function (id) {
                                            });
                                        });
									}
									streamers[json.data[i].user_login].game = json.data[i].game_name != null ? json.data[i].game_name : "N/A";
									streamers[json.data[i].user_login].viewers = json.data[i].viewer_count != null ? json.data[i].viewer_count : "?";
									streamers[json.data[i].user_login].title = json.data[i].title != null ? json.data[i].title : "?";
									streamers[json.data[i].user_login].url = defaultpage + json.data[i].user_login;
									streamers[json.data[i].user_login].created_at = json.data[i].started_at != null ? json.data[i].started_at : "?";
									streamers[json.data[i].user_login].flag = 1;
								}

								/* Check which ones were not streaming so we reset values */
								for (var key in streamers) {
									if (temp.indexOf(key) == -1) {
										streamers[key].flag = 0;
									}
								}
								browser.storage.local.set({'streamers': streamers}, function () {
									browser.browserAction.setBadgeBackgroundColor({"color": (onlineStreams == 0 ? "#B80000" : "#666161")});
									browser.browserAction.setBadgeText({"text": "" + onlineStreams});
									browser.browserAction.setBadgeTextColor({"color": '#FFFFFF'});
									callback();
								});
							});
							urlAppend = "";
						}
					}
				}
			});
        });
    });
}
