NowStreaming
============

https://chrome.google.com/webstore/detail/nowstreaming/cfdokgjlnihoblidldhdomakblbaegim

https://addons.mozilla.org/en-US/firefox/addon/nowstreaming-twitch/

Manage your favorite streamers, get instant notifications when they come online, and much more!

NowStreaming is an extension that will greatly improve the way you manage your favorite Twitch streams.

In addition to having all your favorite streamers in one place, NowStreaming will instantly notify you whenever they go online.

PS: You don't need a Twitch account to use NowStreaming!

First Steps:
- Install the extension! :)
- Go watch a stream on Twitch
- Hit the NowStreaming icon while watching the stream, and start following it!
- That stream will now appear on your NowStreaming popup and you will get notifications everytime it goes online

If you don't want to receive notifications, you can always disable it in the Options Menu.

Advanced Steps:
- You can import your Twitch following list to Now Streaming!
- Hit the Show Options button!
- Hit the Import from Twitch Button
- Enter your Twitch username
- Submit!

Anything you do on NowStreaming *WILL NOT* affect your Twitch account.

Feel free to comment about things you like/don't like, I'll give it a look.

If you like this extension and want to support me, you can Donate through PayPal, I'll be very grateful:
https://www.paypal.me/joaopsys

Logo designed by Igor Carraco: 
https://www.behance.net/igorcarraco

==============================
Changelog:

2.0.0:
- Visual and functional improvements to the popup layout
- Implements sorting on streamer name, game, viewers and uptime by clicking the respective column
- Fixes a bug that caused the stream's uptime to be miscalculated
- Fix various sanitization issues
- Other minor bug fixes

1.8.1:
- Minor fixes to icon loading on Firefox

1.8.0:
- Firefox version released!
- Fix a bug where clicking on notifications would open an about:blank tab
- Update some functions to cope with deprecations

1.7.5:
- Update game icons
- Update jquery

1.7.4:
- Edit notifications title so it has more space for the channel name

1.7.3:
- Adapt the following button for the new Twitch Beta URL

1.7.2:
- Update extension name and description on Chrome Webstore

1.7.1:
- Change the way icons are loaded to avoid errors
- Fix wrapping on uptime
- Fix wrong popout URLs

1.7:
- Reorganize live streamers table to contain stream uptime

1.6.2:
- Fixed a bug when persisting notification state per channel after an extension reload

1.6.1:
- Added game icons and fixed a typo

1.6:
- Fix a critical bug regarding icon file names

1.5:
- Notifications are now configurable per channel

1.4:
- Major code improvements and code cleanup
- Removed all XHR requests
- Fixed bug when syncing Twitch follows (API inconsistency)
- Updated all Twitch API calls for API v5
- Updated all CDNs - jquery, pure CSS, fontawesome
- Fixed insecure (http) Twitch URL
- Fixed and added more game icons

1.3:
- Update Twitch API calls to enforce Client ID.
- More updates coming soon :)

1.2:
- Corrected font path in the following list
- Added more game icons and NS icons for the extensions page
- Fixed a case sensitive situation when following streamers

1.1:
- Changed the font to a more suitable one.

(Public Release) 1.0:
- Redesign of the popup window (Thanks JN!)
- Fixed a rare bug where the stream title and url would be undefined
- Added game icons for some recently popular games

(Public Release) 0.81:
- Brand new and more polished logo (Thank you Igor! https://www.behance.net/igorcarraco)
- Major bug fix (Thank you JN)
- More game icons

(Public Release) 0.7:
- Updated description
- Added a Fast Follow option
- Added a Stream Popout option
- Added a donate button at the end of the popup window :)
- Changed the submit buttons
- 'Sync with Twitch' renamed to 'Import from Twitch'
- Updated some messages and tips
- Fixed a bug where some notifications would be sent after importing data

(Open Beta) 0.6:
- Version number added to the popup
- New Logo!
- Some improvements to icon loading
- Minor bug fixes
- Improved help messages
- You can now go to the streamer's twitch channel even if they're not streaming
- Improved follow functions
- Fixed notifications being sent more than once for the same stream
- More game icons :D
- Added hidden easter egg
- Stream title now shows when you mouse hover an online streamer

(Closed Beta) 0.5:
- Minor bug fixes
- Added export/import local data. You can now keep your favorite streamers even if you format your hard drive :)
- Major bug fix for users following tons of people on twitch
- Fixed a major core bug
- Online streams limit raised to 100
- Added options - you can now choose what the Sync button does and opt to not get notifications.

(Closed Beta) 0.4:
- Many core changes to how/what data is stored
- Popup window got a facelift (added css, game, viewers, unfollow options)
- Some minor bug fixes
- Added some error/help messages that were missing
- Added option to Sync with Twitch
- Added option to unfollow everyone

(Closed Alpha) 0.3:
- Badge text added to the icon, now it shows the number of online streamers
- Alpha popup page (not to say ugly) when user clicks icon, showing current streamers and follows
- Full refresh when user follows or unfollows

(Closed Alpha) 0.2:
- 'background' permission removed - This was non-sense
- Notifications are now awesome
- Sync storage is only used at start and on follow/unfollow, everything else is local
- 1 request to twitch API per minute (instead of 1 per follow)
- Updates and notifies when user starts chrome
- LOTS of bug fixes

(Closed Alpha) 0.1:
- First Alpha version
- Notifications 'kinda' working (super ugly, 2 buttons, urls not matching notification)
- Lots of bugs in sync and local storages
- Follow/Unfollow working but totally out of sync
- Lots of requests, lots of storage writes
- Lots of nulls everywhere
