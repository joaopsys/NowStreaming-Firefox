var nfollowing = 0;
var nstreams = 0;
var defaultDescendingOrder = true;
var defaultSort = 3;
var appClientID = "tn2qigcd7zaj1ivt1xbhw0fl2y99c4y";
var OAuthAccessToken = '';
var defaultpage = "https://twitch.tv/";

$(document).ready(function () {
	$("#optionsDiv").hide();
	$('#heart-div').hide();
	$("#followCurrentButton").hide();
	$("#unfollowCurrentButton").hide();
	$("#noFollowing").hide();
    $("#noToken").hide();
	$("#noStreams").hide();
	$("#streamersTable").hide();
	$("#streamersTableDiv").hide();
	$("#loadingFollowing").show();
	$("#loadingStreams").show();
	$("#unfollowAll").show();
    $("#disconnectTwitch").show();
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
	$("#followingTable #thfirst").on({
		click: function(){
			changeSort(0);
			location.reload();
		}
	});
    $("#streamersTable #thfirst").on({
        click: function(){
            changeSort(0);
        }
    });
	$("#streamersTable #thsecond").on({
		click: function(){
			changeSort(1);
		}
	});
	$("#streamersTable #ththird").on({
		click: function(){
			changeSort(2);
		}
	});
	$("#streamersTable #thfourth").on({
		click: function(){
			changeSort(3);
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
                $("#noToken").hide();
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
			updateTable();
		}
	});
	$("#followingTable").hide();

	$("#themeArea").on({
		click: function(){
			changeTheme();
		}
	})
	//$("#forceUpdate").bind("click", onForceUpdate);
	$("#submitButton").bind("click", function(){
		browser.storage.local.get({
			add: true
		}, function(items) {
			syncWithTwitch(null,null,items.add);
		});
	});
	$("#unfollowAll").bind("click", unfollowAll);
    $("#disconnectTwitch").bind("click", disconnectTwitch);
	$("#exportFollowingButton").bind("click", exportFollowing);
	$("#importFollowingButton").bind("click",importFollowing);
    $("#authenticate").bind("click",authenticate);
	$("#submitData").bind("click", importData);
	$("#submitFastFollow").bind("click", fastFollow);

	$("#versionDiv").append(browser.runtime.getManifest().version);

	updateTable();
	updateTheme();
});

function authenticate(){
    browser.runtime.sendMessage({type: 3}, function() {
    });
}

function disconnectTwitch(){
    browser.runtime.sendMessage({type: 4}, function() {
        onForceUpdate();
    });
}

// 0 = streamer, 1 = game, 2 = viewers, 3 = uptime
function updateTable() {
	browser.storage.local.get({sortMethod: {}, streamers:{}, access_token: ''}, function (result) {
		streamersDict = result.streamers;
		// Creating an array based on the dictionary list for it to be sorted
		streamersArray = Object.keys(streamersDict).map(function(key) {
			return [key, streamersDict[key]];
		});

		// Sort functions
		selectedSort = result.sortMethod['selectedSort'] != null ? result.sortMethod['selectedSort'] : defaultSort;
		descendingOrder = result.sortMethod['descendingOrder'] != null ? result.sortMethod['descendingOrder'] : defaultDescendingOrder;
		updateSortIcons(selectedSort, descendingOrder);
		switch(selectedSort){
			case 0:
				// Sort by streamer name
				streamersArray.sort(function(first, second) {
					if (first[0] < second[0])
						return descendingOrder ? 1 : -1;
					else
						return descendingOrder ? -1 : 1;
				});
				break;
			case 1:
				// Sort by Game
				streamersArray.sort(function(first, second) {
					if (first[1]["game"] < second[1]["game"])
						return descendingOrder ? 1 : -1;
					else
						return descendingOrder ? -1 : 1;
				});
				break;
			case 2:
				// Sort by viewers
				streamersArray.sort(function(first, second) {
					return descendingOrder ? second[1]["viewers"] - first[1]["viewers"] : first[1]["viewers"] - second[1]["viewers"];
				});
				break;
			default:
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
		
					return descendingOrder ? firstDate - secondDate : secondDate - firstDate;
				});
				break;
			}
		nfollowing=0;
		nstreams=0;
		$("#tableBody").empty();
		streamers = streamersArray;
		for (var key in streamers){
			nfollowing++;
			$("#followingTable").show();
			if (nfollowing%2==0)
				$("#followingTable").append("<tr id=\""+streamers[key][0]+"\"><td><a class=\"streamerpage table-even\" href=\""+sanitize(streamers[key][1]["url"], defaultpage+streamers[key][0])+"\" target=\"_blank\">"+sanitize(streamers[key][0])+"</a></td>"+(streamers[key][1]["flag"]?"<td><span style=\"color:var(--accept)\">Online</span></td>":"<td><span style=\"color:var(--warning)\">Offline</span></td>")+"<td><a title=\"Unfollow "+sanitize(streamers[key][0])+"\" class=\"fa fa-times fa-lg masterTooltip unfollowstreamer\" id=\"unfollow-"+streamers[key][0]+"\" href=\"#\"></a></td><td><input type =\"checkbox\" class=\"checkbox\" id=\"notifications-"+streamers[key][0]+"\"/></td></tr>");
			else
				$("#followingTable").append("<tr class=\"table-odd\" id=\""+streamers[key][0]+"\"><td><a class=\"streamerpage\" href=\""+sanitize(streamers[key][1]["url"], defaultpage+streamers[key][0])+"\" target=\"_blank\">"+sanitize(streamers[key][0])+"</a></td>"+(streamers[key][1]["flag"]?"<td><span style=\"color:var(--accept)\">Online</span></td>":"<td><span style=\"color:var(--warning)\">Offline</span></td>")+"<td><a title=\"Unfollow "+sanitize(streamers[key][0])+"\" class=\"fa fa-times fa-lg masterTooltip unfollowstreamer\" id=\"unfollow-"+streamers[key][0]+"\" href=\"#\"></a></td><td><input type =\"checkbox\" class=\"checkbox\" id=\"notifications-"+streamers[key][0]+"\"/></td></tr>");
			$("#unfollow-"+streamers[key][0]+"").bind("click", {name: streamers[key][0], remove: 1}, followCurrent);
			$("#notifications-"+streamers[key][0]+"").bind("click", {name: streamers[key][0]}, check_single_notifications);
		}

        $("#loadingFollowing").hide();

        if (nfollowing <= 0){
            $("#noFollowing").show();
            $("#unfollowAll").hide();
            $("#manageFollowingButton").hide();
            $("#streamersDiv").hide();
        }

        OAuthAccessToken = result.access_token;
        if (result.access_token == ''){
            $("#noFollowing").hide();
            $("#disconnectTwitch").hide();
            $("#fastFollow").hide();
            $("#streamersDiv").hide();
            $("#noToken").show();
            return;
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
					$("#streamersTable").append("<tr class=\" list-row table-even\" id=\"row"+sanitize(streamers[key][0])+"\"><td nowrap><i title=\"Popout this stream\" class=\"masterTooltip popout fas fa-share-square fa-lg\"></i><a title=\""+sanitize(streamers[key][1]["title"])+"\" class=\"streamerpage masterTooltip\" href=\""+sanitize(streamers[key][1]["url"], defaultpage+key)+"\" target=\"_blank\">"+sanitize(streamers[key][0])+"</a></td><td><img src=\""+loadIcon(streamers[key][1]["game"])+"\" title=\""+sanitize(streamers[key][1]["game"])+"\" class=\"masterTooltip\" width=\"30\" height=\"30\"/></td><td><span class=\"viewersclass\">"+streamers[key][1]["viewers"]+"</span></td><td nowrap><span class=\"uptimeclass\">"+getUptime(streamers[key][1]["created_at"])+"</span></td></tr>");
				else
					$("#streamersTable").append("<tr class=\" list-row table-odd\" id=\"row"+sanitize(streamers[key][0])+"\"><td nowrap><i title=\"Popout this stream\" class=\"masterTooltip popout fas fa-share-square fa-lg\"></i><a title=\""+sanitize(streamers[key][1]["title"])+"\" class=\"streamerpage masterTooltip\" href=\""+sanitize(streamers[key][1]["url"], defaultpage+key)+"\" target=\"_blank\">"+sanitize(streamers[key][0])+"</a></td><td><img src=\""+loadIcon(streamers[key][1]["game"])+"\" title=\""+sanitize(streamers[key][1]["game"])+"\" class=\"masterTooltip\" width=\"30\" height=\"30\"/></td><td><span class=\"viewersclass\">"+streamers[key][1]["viewers"]+"</span></td><td nowrap><span class=\"uptimeclass\">"+getUptime(streamers[key][1]["created_at"])+"</span></td></tr>");
			}
		}
		$("#streamersTable").append("</tbody>");

		$(".masterTooltip").bind("mouseenter", showTooltip);

		$(".masterTooltip").bind("mouseleave", hideTooltip);
		$(".masterTooltip").bind("mousemove", updateTooltip);
		
		$(".popout").bind("click",popoutStream);

		$("#loadingStreams").hide();

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
			var tabUrl = arrayOfTabs[0].url;

			if (tabUrl.indexOf("twitch.tv/") != -1){
                var name = new URL(tabUrl).pathname.substring(1).toLowerCase();

				/* Check if name is a streamer */
				twitchAPICall(0,name).then(result => {
					userID = getUserID(result)
					if (userID > 0) {
						if (streamersDict[name]) {
							remove = 1;
							$("#heart-div").show();
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
							$("#heart-div").show();
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
					else {
						$("#heart-div").hide();
					}
				});
			}
		});
	});
}

function updateTheme() {
	browser.storage.local.get({'darkmode':false}, function (result) {
	        root = document.documentElement;
		darkMode = result.darkmode
        	if(darkMode) {
                	root.classList.remove('light-theme');
                	root.classList.add('dark-theme');
        	} else {
                	root.classList.remove('dark-theme')
                	root.classList.add('light-theme');
        	}
	});
}

function changeTheme() {
        browser.storage.local.get({'darkmode':false}, function (result) {
                browser.storage.local.set({'darkmode': !result.darkmode}, function () {
			updateTheme();
                });
	});
}

function changeSort(newSelection) {
	browser.storage.local.get({sortMethod: {}}, function(result) {
		selectedSort = result.sortMethod['selectedSort'] != null ? result.sortMethod['selectedSort'] : defaultSort;
                descendingOrder = result.sortMethod['descendingOrder'] != null ? result.sortMethod['descendingOrder'] : defaultDescendingOrder;
		if(selectedSort == newSelection) {
			descendingOrder = !descendingOrder;
		}
		newSortMethod = {}
		newSortMethod['selectedSort'] = newSelection;
		newSortMethod['descendingOrder'] = descendingOrder;
		browser.storage.local.set({sortMethod: newSortMethod}, function () {
			updateTable();
		});
        });
}

function updateSortIcons(selectedSort, descendingOrder) {
	// Remove current selection icon
	$(".sortIcon").remove();

	// Add new selection icon
	let columnName;
	switch(selectedSort) {
		case 0:
			columnName = "#thfirst";
			break;
		case 1:
			columnName = "#thsecond";
			break;
		case 2:
			columnName = "#ththird";
			break;
		default:
			columnName = "#thfourth";
			break;
	}

	if(descendingOrder) {
		$(columnName).append("<i class=\"sortIcon fas fa-sort-down\"></i>");
	}
	else {
		$(columnName).append("<i class=\"sortIcon fas fa-sort-up\"></i>");
	}
}

function popoutStream(e){
	var url = $(this).next().attr('href');
	window.open(url+"/popout", url, "height=600,width=850");
	return false;
}

function showTooltip(e){
	var title = $(this).attr('title');
	if (!title)
		return;
	$(this).data('tipText', title).removeAttr('title');
	$('<p class="tooltip"></p>')
	.text(title)
	.appendTo('body')
	.fadeIn('fast');
	
	// Tooltip too close to top of window
	if(e.pageY < 70) {
		var mousex = e.pageX; //Get X coordinates
		var mousey = e.pageY + $('.tooltip').height(); //Get Y coordinates
	}
	else {
		var mousex = e.pageX - 20; //Get X coordinates
		var mousey = e.pageY - 50 - $('.tooltip').height(); //Get Y coordinates
	}
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
        browser.runtime.sendMessage({type: 1, channel: user, subType: 2}, function() {
        });
    }
    else{
        browser.runtime.sendMessage({type: 1, channel: user, subType: 3}, function() {
        });
    }
}

function hideTooltip(e){
	$(this).attr('title', $(this).data('tipText'));
	$('.tooltip').remove();
}

function updateTooltip(e){
	if(e.pageY < 70) {
		var mousex = e.pageX; //Get X coordinates
		var mousey = e.pageY + $('.tooltip').height(); //Get Y coordinates
	}
	else {
		var mousex = e.pageX - 20; //Get X coordinates
		var mousey = e.pageY - 50 - $('.tooltip').height(); //Get Y coordinates
	}
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
				syncWithTwitch(null,null,items.add);
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
	twitchAPICall(0,user).then(result => {
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

function syncWithTwitch(pagination, storage, add){
	if (pagination == ''){
        browser.storage.local.set({'streamers': storage.streamers}, function () {
            onForceUpdate();
        });
        document.getElementById("syncWithTwitchInput").value = '';
        return
	}
	var user = document.getElementById("syncWithTwitchInput").value;
	user = user.toLowerCase();
	if (user == "mlg360noscope420blazeit"){
		browser.tabs.create({url: "https://youtu.be/kHYZDveT46c"});
		return;
	}
	// If user selected 'add' instead of replace, we'll call this function again with his current follows
	if (storage == null){
		browser.storage.local.get({streamers:{}, 'notifications':true}, function (result) {
			if (add)
				syncWithTwitch(pagination,result);
			else{
				result.streamers={}
				syncWithTwitch(pagination,result);
			}
		});
	}
	else{
		// We're ready to get his follows
		twitchAPICall(0,user).then(result => {
			var userID = getUserID(result)
			if (userID > 0) {
				twitchAPICall(1, userID, pagination).then(json => {
					if (json.data.length > 0) {
                        $("#importTwitchLoading").show();
						for (var i = 0; i < json.data.length; i++) {
							storage.streamers[json.data[i].to_login] = {
								flag: 1,
								game: "null",
								viewers: -1,
								url: "null",
								created_at: "null",
								title: "null",
								notify: storage.notifications
							};
						}
						syncWithTwitch(json.pagination.cursor==null?'':json.pagination.cursor, storage, add);
					}
					else{
                        $("#importTwitchFailMessage").html("<br>The follow list for that user is empty.");
                        $("#importTwitchFailMessage").css("font-weight","bold");
                        $("#importTwitchFailMessage").css("color","red");
                        $("#importTwitchFailMessage").show();
                        document.getElementById("syncWithTwitchInput").value = '';
					}
				});
			}
			else{
				if (OAuthAccessToken == '')
					$("#importTwitchFailMessage").html("You need to link your Twitch account with NowStreaming before using this feature.");
				else
                    $("#importTwitchFailMessage").html("Invalid Twitch username.");
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
                onForceUpdate();
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
	var allowedIcons = ["apexlegends.png", "archeage.png", "asmr.png", "battlefield3.png", "battlefield4.png", "callofdutyblackopsii.png", "callofdutyghosts.png", "chess.png", "counter-strikeglobaloffensive.png", "darksoulsii.png", "dayz.png", "destiny.png", "diabloiii.png", "diabloiiireaperofsouls.png", "don'tstarve.png", "dota2.png", "evolve.png", "escapefromtarkov.png", "justchatting.png", "fortnite.png", "finalfantasyxivonline.png", "garry'smod.png", "grandtheftautov.png", "guildwars2.png", "h1z1justsurvive.png", "h1z1kingofthekill.png", "hearthstone.png", "heroesofthestorm.png", "hades.png", "leagueoflegends.png", "left4dead2.png", "lostark.png", "lethalleague.png", "lifeisfeudalyourown.png", "magicthegathering.png", "mariokart8.png", "mariokart8deluxe.png", "newworld.png", "middle-earthshadowofmordor.png", "minecraft.png", "music.png", "osu!.png", "outlast.png", "overwatch.png", "pathofexile.png", "payday2.png", "playerunknown'sbattlegrounds.png", "poker.png", "rift.png", "rocketleague.png", "runescape.png", "rust.png", "smite.png", "starcraftii.png", "thebindingofisaac.png", "thebindingofisaacrebirth.png", "thebindingofisaacrepentance.png", "supersmashbros.ultimate.png", "supersmashbros.melee.png", "callofdutywarzone.png", "bloodborne.png", "projectzomboid.png", "theelderscrollsvskyrim.png", "theevilwithin.png", "thesims4.png", "vrchat.png", "valorant.png", "teamfighttactics.png", "deadbydaylight.png", "thewalkingdead.png", "warframe.png", "wildstar.png", "worldoftanks.png", "worldofwarcraft.png"];
	var generatedIcon = game.replace(/\:| /g,'').toLowerCase()+".png";

	if (allowedIcons.includes(generatedIcon))
		return "gameicons/"+generatedIcon;
	else
		return "icon.png";
}

function onForceUpdate(){
    browser.runtime.sendMessage({type: 0, is_first_run: 1}, function() {
        location.reload();
    });
}

function followCurrent(event){
	directFollow(event.data.name,event.data.remove);
}

function directFollow(user,remove){
    browser.runtime.sendMessage({type: 1, channel: user.trim(), subType: remove}, function() {
        location.reload();
    });
}

async function twitchAPICall(type, channel, pagination){
	switch(type){
		case 0:
			// User to ID
			var url = "https://api.twitch.tv/helix/users/?login="+channel
			break;
		case 1:
			// Get user follows with limit and offset
			var url = "https://api.twitch.tv/helix/users/follows?from_id="+channel+"&first=100"+(pagination ? '&after='+pagination : '');
	}
	const response = await fetch(url,{
		headers: {
			'Client-ID': appClientID,
            'Authorization': 'Bearer ' + OAuthAccessToken
		},
		method: 'GET'
	});
	return response.json();
}

function sanitize(string, defaultreturn="?"){
	if (string == null || string == "null" || string == "")
		return defaultreturn;
	sanitized = string.replace('>','&gt;').replace('<','&lt;').replace(/\"/g,'&quot;');
	return sanitized;
}

function getUserID(result){
	try{
		return result.data[0].id;
	}catch(e){
		return -1;
	}
}
