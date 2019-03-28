$(document).ready(function () {
	restore_options();
});

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  browser.storage.local.get({
    streamers: {},
    notifications: true,
    add: true
  }, function(items) {
  	$('input[type=checkbox]').each(function () {
  		var current = this.id.substring(this.id.indexOf('-')+1)
  		this.checked = items.streamers[current].notify;
  	});
    //document.getElementById('notifications').checked = items.notifications;
    //document.getElementById('checkadd').checked = items.add;
    //document.getElementById('checkreplace').checked = !(items.add);
  });
}
