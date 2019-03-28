$(document).ready(function () {
	var nfollowing=0;
	var nstreams=0;

	$("#optionsDiv").hide();
	$("#followCurrentButton").hide();
	$("#unfollowCurrentButton").hide();
	$("#noFollowing").hide();
	$("#noStreams").hide();
	$("#streamersTable").hide();
	$("#streamersTableDiv").hide();
	$("#loadingFollowing").show();
	$("#loadingStreams").show();
	$("#unfollowAll").show();
	$("#textBox").hide();
	$("#importDiv").hide();
	$("#fastFollowMessage").hide();
	$("#importTwitchLoading").hide();
	$("#importDataFailMessage").hide();
	$("#importTwitchFailMessage").hide();
	$(".currentMessage").hide();
	$(".manageFollowingMessage").hide();
	$("#manageFollowingButton").on({
		mouseenter: function () {
	        $(".manageFollowingMessage").show();
	    },
	    mouseleave: function () {
	        $(".manageFollowingMessage").hide();
		},
		click: function(){
			window.open("following.html");
			return false;
		}
	});
	$("#toggleOptions").on({
		click: function(){
			if ($("#optionsDiv").css('display') == 'none'){
				$("#optionsDiv").show();
				$("#toggleOptions").addClass("selected-tab");
				$("#streamersDiv").hide();
				$("#fastFollow").hide();
				$("#noFollowing").hide();
				$("#fastFollowMessage").hide();
				$("#toggleStreamers").removeClass("selected-tab");
			}
		}
	});
	$("#toggleStreamers").on({
		click: function(){
			if ($("#streamersDiv").css('display') == 'none'){
				$("#fastFollow").show();
				$("#toggleStreamers").addClass("selected-tab");
				$("#optionsDiv").hide();
				$("#toggleOptions").removeClass("selected-tab");

				if(nfollowing <= 0) {
					$("#noFollowing").show();
				}
				if(nstreams <= 0 && nfollowing > 0) {
					$("#noStreams").show();
					$("#streamersDiv").show();
				}
				if(nstreams > 0) {
					$("#streamersDiv").show();
				}
			}
		}
	});
	$("#followingTable").hide();

	//$("#forceUpdate").bind("click", onForceUpdate);
	$("#submitButton").bind("click", function(){
		browser.storage.local.get({
			add: true
		}, function(items) {
			syncWithTwitch(50,0,null,items.add);
		});
	});
	$("#unfollowAll").bind("click", unfollowAll);
	$("#exportFollowingButton").bind("click", exportFollowing);
	$("#importFollowingButton").bind("click",importFollowing);
	$("#submitData").bind("click", importData);
	$("#submitFastFollow").bind("click", fastFollow);

	$("#versionDiv").append(browser.runtime.getManifest().version);

	browser.storage.local.get({streamers:{}}, function (result) {
		streamersDict = result.streamers;
		// Creating an array based on the dictionary list for it to be sorted
		streamersArray = Object.keys(streamersDict).map(function(key) {
			return [key, streamersDict[key]];
		});

		// Sort functions

		// Sort by viewers
		/*streamersArray.sort(function(first, second) {
			return second[1]["viewers"] - first[1]["viewers"];
		});*/

		// Sort by streamer name
                /*streamersArray.sort(function(first, second) {
			if (first[0] < second[0])
				return -1;
			else
				return 1;
                });*/

		// Sort by Game
                /*streamersArray.sort(function(first, second) {
                        if (first[1]["game"] < second[1]["game"])
                                return -1;
                        else
                                return 1;
                });*/

		// Sort by uptime
                streamersArray.sort(function(first, second) {
			if (first[1]["created_at"] == "null")
				firstDate = new Date (1970,01);
			else
				firstDate = new Date(first[1]["created_at"]);
			if (second[1]["created_at"] == "null")
				secondDate = new Date(1970,01);
			else
				secondDate = new Date(second[1]["created_at"]);

			return firstDate - secondDate;
                });

		var defaultpage = "https://twitch.tv/";
		nfollowing=0;
		nstreams=0;
		$("#streamersTable").append("<tbody>");
		// Looping on the dictionary first
		// We will keep the following list unsorted / sorted alphabetically
		streamers = streamersDict;
		for (var key in streamers){
			nfollowing++;
			$("#followingTable").show();
			if (nfollowing%2==0)
				$("#followingTable").append("<tr id=\""+key+"\"><td><a class=\"streamerpage\" href=\""+(streamers[key].url==null?(defaultpage+key):streamers[key].url=="null"?(defaultpage+key):streamers[key].url)+"\" target=\"_blank\">"+key+"</a></td>"+(streamers[key].flag?"<td><span style=\"color:#29CC29\">Online</span></td>":"<td><span style=\"color:#CC2929\">Offline</span></td>")+"<td><a title=\"Unfollow "+key+"\" class=\"fa fa-times fa-lg masterTooltip unfollowstreamer\" id=\"unfollow-"+key+"\" href=\"#\"></a></td><td><input type =\"checkbox\" class=\"checkbox\" id=\"notifications-"+key+"\"/></td></tr>");
			else
				$("#followingTable").append("<tr class=\"pure-table-odd\" id=\""+key+"\"><td><a class=\"streamerpage\" href=\""+(streamers[key].url==null?(defaultpage+key):streamers[key].url=="null"?(defaultpage+key):streamers[key].url)+"\" target=\"_blank\">"+key+"</a></td>"+(streamers[key].flag?"<td><span style=\"color:#29CC29\">Online</span></td>":"<td><span style=\"color:#CC2929\">Offline</span></td>")+"<td><a title=\"Unfollow "+key+"\" class=\"fa fa-times fa-lg masterTooltip unfollowstreamer\" id=\"unfollow-"+key+"\" href=\"#\"></a></td><td><input type =\"checkbox\" class=\"checkbox\" id=\"notifications-"+key+"\"/></td></tr>");
			$("#unfollow-"+key+"").bind("click", {name: key, remove: 1}, followCurrent);
			$("#notifications-"+key+"").bind("click", {name: key}, check_single_notifications);
		}
		// Looping on the array now
		// This one we want to sort
		streamers = streamersArray;
		for (var key in streamers){
			if (streamers[key][1]["flag"]){
				nstreams++;
				$("#streamersTableDiv").show();
				$("#streamersTable").show();
				if (nstreams % 2 == 0)
					$("#streamersTable").append("<tr class=\" list-row\" id=\"row"+streamers[key][0]+"\"><td nowrap><i title=\"Popout this stream\" class=\"masterTooltip popout fas fa-share-square fa-lg\"></i><a title=\""+(streamers[key][1]["title"]==null?"?":streamers[key][1]["title"]=="null"?"?":streamers[key][1]["title"])+"\" class=\"streamerpage masterTooltip\" href=\""+(streamers[key][1]["url"]==null?(defaultpage+key):streamers[key][1]["url"]=="null"?(defaultpage+key):streamers[key][1]["url"])+"\" target=\"_blank\">"+streamers[key][0]+"</a></td><td><img src=\""+loadIcon(streamers[key][1]["game"])+"\" title=\""+streamers[key][1]["game"]+"\" class=\"masterTooltip\" width=\"30\" height=\"30\"/></td><td><span class=\"viewersclass\">"+streamers[key][1]["viewers"]+"</span></td><td nowrap><span class=\"uptimeclass\">"+getUptime(streamers[key][1]["created_at"])+"</span></td></tr>");
				else
					$("#streamersTable").append("<tr class=\" list-row pure-table-odd\" id=\"row"+streamers[key][0]+"\"><td nowrap><i title=\"Popout this stream\" class=\"masterTooltip popout fas fa-share-square fa-lg\"></i><a title=\""+(streamers[key][1]["title"]==null?"?":streamers[key][1]["title"]=="null"?"?":streamers[key][1]["title"])+"\" class=\"streamerpage masterTooltip\" href=\""+(streamers[key][1]["url"]==null?(defaultpage+key):streamers[key][1]["url"]=="null"?(defaultpage+key):streamers[key][1]["url"])+"\" target=\"_blank\">"+streamers[key][0]+"</a></td><td><img src=\""+loadIcon(streamers[key][1]["game"])+"\" title=\""+streamers[key][1]["game"]+"\" class=\"masterTooltip\" width=\"30\" height=\"30\"/></td><td><span class=\"viewersclass\">"+streamers[key][1]["viewers"]+"</span></td><td nowrap><span class=\"uptimeclass\">"+getUptime(streamers[key][1]["created_at"])+"</span></td></tr>");

			}
		}
		$("#streamersTable").append("</tbody>");

		$(".masterTooltip").bind("mouseenter", showTooltip);

		$(".masterTooltip").bind("mouseleave", hideTooltip);
		$(".masterTooltip").bind("mousemove", updateTooltip);
		
		$(".popout").bind("click",popoutStream);


		$("#loadingFollowing").hide();
		$("#loadingStreams").hide();

		if (nfollowing <= 0){
			$("#noFollowing").show();
			$("#unfollowAll").hide();
			$("#manageFollowingButton").hide();
			$("#streamersDiv").hide();
		}

		if (nstreams <= 0 && nfollowing > 0){
			$("#noStreams").show();
			$("#streamersTableDiv").hide();
			$("#streamersTable").hide();
			$("#streamersDiv").show();
		}

		if (nstreams > 0) {
			$("#streamersDiv").show();
		}

		browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
			tabUrl = arrayOfTabs[0].url;

			if (tabUrl.indexOf("twitch.tv/") != -1){
				var parts = tabUrl.split('/');
				var name = parts[3];
				name = name.toLowerCase();

				/* Check if name is a streamer */
				twitchAPICall(0,name).done(function (result) {
					userID = getUserID(result)
					if (userID > 0) {
						if (streamersDict[name]) {
							remove = 1;
							$("#unfollowCurrentButton").show();
							$(".currentMessage").html(" Unfollow " + name);
							$("#unfollowCurrentButton").bind("click", {name: name, remove: remove}, followCurrent);
							$("#unfollowCurrentButton").on({
								mouseenter: function () {
									$(".currentMessage").show();
								},
								mouseleave: function () {
									$(".currentMessage").hide();
								}
							});
						}
						else {
							remove = 0;
							$("#followCurrentButton").show();
							$(".currentMessage").html(" Follow " + name);
							$("#followCurrentButton").bind("click", {name: name, remove: remove}, followCurrent);
							$("#followCurrentButton").on({
								mouseenter: function () {
									$(".currentMessage").show();
								},
								mouseleave: function () {
									$(".currentMessage").hide();
								}
							});
						}
					}
				});
			}
		});

	});
});

function popoutStream(e){
	var url = $(this).next().attr('href');
	window.open(url+"/popout", url, "height=600,width=850");
	return false;
}

function showTooltip(e){
	var title = $(this).attr('title');
	$(this).data('tipText', title).removeAttr('title');
	$('<p class="tooltip"></p>')
	.text(title)
	.appendTo('body')
	.fadeIn('slow');
	var mousex = e.pageX - 20; //Get X coordinates

	// if(e.pageY < 70) {
		// var mousey = e.pageY + $('.tooltip').height(); //Get Y coordinates
		var mousey = 0;
	// }
	// else {
	// 	var mousey = e.pageY - 50 - $('.tooltip').height(); //Get Y coordinates
	// }
	$('.tooltip')
	.css({ top: mousey, left: mousex })
}

function getUptime(created){
	if (created == null){
		return "?";
	}
	var todayDate = new Date()
	var streamDate = new Date(created);
	var delta = Math.abs(todayDate - streamDate) / 1000;
	var hours = Math.floor(delta / 3600);
	delta -= hours * 3600;
	var minutes = Math.floor(delta / 60);
	if (hours > 0){
		return hours+"h"+" "+minutes+"m"
	}
	else {
		return minutes+"m"
	}
}

function check_single_notifications(event){
	var user = event.data.name;
	if(document.getElementById("notifications-"+user).checked) {
    	browser.runtime.getBackgroundPage(function(backgroundPage) {
			backgroundPage.addToStorage(user,2,function(){
			});
		});
	}
	else{
		browser.runtime.getBackgroundPage(function(backgroundPage) {
			backgroundPage.addToStorage(user,3,function(){
			});
		});
	}
}

function hideTooltip(e){
	$(this).attr('title', $(this).data('tipText'));
	$('.tooltip').remove();
}

function updateTooltip(e){
	var mousex = e.pageX - 20; //Get X coordinates
	var mousey = e.pageY - 50 - $('.tooltip').height(); //Get Y coordinates\
	$('.tooltip')
	.css({ top: mousey, left: mousex })
}


$(window).keydown(function(event){
	if(event.keyCode == 13){
		event.preventDefault();

		if($("#fastFollowInput").is(":focus")){
			fastFollow();
		}
		else if($("#syncWithTwitchInput").is(":focus")){
			browser.storage.local.get({
				add: true
			}, function(items) {
				syncWithTwitch(50,0,null,items.add);
			});
		}
		else if($("#importDataInput").is(":focus")){
			importData();
		}
		return false;
	}
});

function fastFollow(){
	var user = document.getElementById("fastFollowInput").value;
	user = user.toLowerCase();
	twitchAPICall(0,user).done(function (result) {
		userID = getUserID(result);
		if (userID > 0)
			directFollow(user,0);
		else{
			$("#fastFollowMessage").html("<br>Cannot find "+user);
			$("#fastFollowMessage").css("font-weight","bold");
			$("#fastFollowMessage").css("color","red");
			$("#fastFollowMessage").show();
		}
	});
	document.getElementById("fastFollowInput").value = '';
}

function syncWithTwitch(limit, offset, storage, add){
	var user = document.getElementById("syncWithTwitchInput").value;
	user = user.toLowerCase();
	if (user == "mlg360noscope420blazeit")
		window.open("https://youtu.be/kHYZDveT46c");
	// If user selected 'add' instead of replace, we'll call this function again with his current follows
	if (storage == null){
		browser.storage.local.get({streamers:{}, 'notifications':true}, function (result) {
			if (add)
				syncWithTwitch(limit,offset,result);
			else{
				result.streamers={}
				syncWithTwitch(limit,offset,result);
			}
		});
	}
	else{
		// We're ready to get his follows
		twitchAPICall(0,user).done(function (result) {
			var userID = getUserID(result)
			if (userID > 0) {
				twitchAPICall(1, userID, limit, offset).done(function (json) {
					$("#importTwitchLoading").show();
					if (json.follows.length == 0) {
						browser.storage.local.set({'streamers': storage.streamers}, function () {
							onForceUpdate();
						});
						document.getElementById("syncWithTwitchInput").value = '';
					}
					else {
						for (var i = 0; i < json.follows.length; i++) {
							storage.streamers[json.follows[i].channel.name] = {
								flag: 1,
								game: "null",
								viewers: -1,
								url: "null",
								created_at: "null",
								title: "null",
								notify: storage.notifications
							};
						}
						syncWithTwitch(limit, offset + limit, storage, add);
					}
				});
			}
			else{
				$("#importTwitchFailMessage").html("<br>Invalid Twitch username!");
				$("#importTwitchFailMessage").css("font-weight","bold");
				$("#importTwitchFailMessage").css("color","red");
				$("#importTwitchFailMessage").show();
				document.getElementById("syncWithTwitchInput").value = '';
			}
		});
	}
}

function exportFollowing(){
	if($("#textBox").css('display') == 'none') {
		browser.storage.local.get({streamers:{}}, function (result) {
			$("#textBox").show();
			var streamers = result.streamers;
			$("#exportBox").val(JSON.stringify(streamers));
		});

		if($("#importDiv").css('display') != 'none') {
			$("#importDiv").hide();
			$("#importDataFailMessage").hide();
		}
	}
	else {
		$("#textBox").hide();
	}
	
}

function importFollowing(){
	if($("#importDiv").css('display') == 'none') {
		$("#importDiv").show();

		if($("#textBox").css('display') != 'none') {
			$("#textBox").hide();
		}
	}
	else {
		$("#importDiv").hide();
		$("#importDataFailMessage").hide();
	}
}

function importData(){
	var data = document.getElementById("importDataInput").value;
	try{
		var streamers = JSON.parse(data);
		browser.storage.local.get({'notifications':true}, function (result) {
			for (var key in streamers){
				// Backwards compatibility
				if (streamers[key].notify == null){
					streamers[key].notify = result.notifications;
				}
			}
			browser.storage.local.set({'streamers': streamers}, function () {
				browser.runtime.getBackgroundPage(function(backgroundPage) {
					backgroundPage.updateCore(1,function(){location.reload();});
				});
			});
		});
	}catch(e){
		$("#importDataFailMessage").html("<br>Invalid data format!");
		$("#importDataFailMessage").css("font-weight","bold");
		$("#importDataFailMessage").css("color","red");
		$("#importDataFailMessage").show();
	}
	document.getElementById("importDataInput").value = '';
}

function unfollowAll(){
	browser.storage.local.set({'streamers': {}}, function () {});
	onForceUpdate();
}

// Dirty, I know. But hey, it works and it's fast
function loadIcon(game) {
	var allowedIcons = ["apexlegends.png", "archeage.png", "battlefield3.png", "battlefield4.png", "callofdutyblackopsii.png", "callofdutyghosts.png", "chess.png", "counter-strikeglobaloffensive.png", "darksoulsii.png", "dayz.png", "destiny.png", "diabloiii.png", "diabloiiireaperofsouls.png", "don'tstarve.png", "dota2.png", "evolve.png", "fortnite.png", "garry'smod.png", "grandtheftautov.png", "guildwars2.png", "h1z1justsurvive.png", "h1z1kingofthekill.png", "hearthstone.png", "heroesofthestorm.png", "leagueoflegends.png", "left4dead2.png", "lethalleague.png", "lifeisfeudalyourown.png", "magicthegathering.png", "mariokart8.png", "middle-earthshadowofmordor.png", "minecraft.png", "music.png", "osu!.png", "outlast.png", "overwatch.png", "pathofexile.png", "payday2.png", "playerunknown'sbattlegrounds.png", "poker.png", "rift.png", "rocketleague.png", "runescape.png", "rust.png", "smite.png", "starcraftii.png", "thebindingofisaac.png", "thebindingofisaacrebirth.png", "theelderscrollsvskyrim.png", "theevilwithin.png", "thesims4.png", "thewalkingdead.png", "warframe.png", "wildstar.png", "worldoftanks.png", "worldofwarcraft.png"];
	var generatedIcon = game.replace(/\:| /g,'').toLowerCase()+".png";

	if (allowedIcons.includes(generatedIcon))
		return "gameicons/"+generatedIcon;
	else
		return "icon.png";
}

function onForceUpdate(){
	browser.runtime.getBackgroundPage(function(backgroundPage) {
		backgroundPage.updateCore(1,function(){location.reload();});
		//location.reload();
	});
}

function followCurrent(event){
	directFollow(event.data.name,event.data.remove);
}

function directFollow(user,remove){
	browser.runtime.getBackgroundPage(function(backgroundPage) {
		backgroundPage.addToStorage(user,remove,function(){
			location.reload();
		});
	});
}

function twitchAPICall(type, channel, limit, offset){
	var appClientID = "tn2qigcd7zaj1ivt1xbhw0fl2y99c4y";
	var acceptVersion = "application/vnd.twitchtv.v5+json";
	switch(type){
		case 0:
			// User to ID
			var url = "https://api.twitch.tv/kraken/users/?login="+channel
			break;
		case 1:
			// Get user follows with limit and offset
			var url = "https://api.twitch.tv/kraken/users/"+channel+"/follows/channels?limit="+limit+"&offset="+offset;
	}
	return $.ajax({
		url : url,
		headers: {
			'Client-ID': appClientID,
			'Accept': acceptVersion
		},
		dataType: "json",
		type: 'GET'
	});
}

function getUserID(result){
	try{
		return result.users[0]._id;
	}catch(e){
		return -1;
	}
}
