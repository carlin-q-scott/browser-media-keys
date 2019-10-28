Build Status
============

| Linux | Windows |
|-------|---------|
| [![Linux Build Status](https://travis-ci.org/carlin-q-scott/browser-media-keys.svg?branch=master)](https://travis-ci.org/carlin-q-scott/browser-media-keys) | [![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/carlin-q-scott/browser-media-keys)](https://ci.appveyor.com/project/carlin-q-scott/browser-media-keys) |

**NOTE: AFTER 52 VERSION FIREFOX DROPPED LEGACY ADDONS SUPPORT, AND DIDN'T GIVE NEW API TO PROPERLY SUPPORT GLOBAL HOTKEYS!** Please see [this issue](https://github.com/carlin-q-scott/browser-media-keys/issues/160).

Description
==================

Lets you control various media sites using the media keys on your keyboard without having the Firefox window active. Supported Sites: youtube, pandora, spotify, bandcamp, google play, yandex, soundcloud, tidal, deezer, plex, vk and more.

 	
Your media keys should work without the Firefox window active for Linux (w/ Gnome) and Windows but please let us know if this isn't the case by providing us with the version of your operating system, and model of keyboard or laptop you're using.

Please find us on GitHub if you'd like to request features, post issues or contribute to the project.

Supported Sites: youtube, pandora, spotify, bandcamp, google play, yandex, soundcloud, tidal, deezer, plex, vk, subsonic, jamstash, overcast.fm, music.amazon.co.uk, music.amazon.com, di.fm, netflix.com, and tunein.com.


Support on Linux
---------------------
#### After v.1.0
Now this add-on uses XCB to capture key presses.

**Requirements**: `libxcb-keysyms` library (`libxcb-keysyms1` package for deb-based distributives, `xcb-util-keysyms` for yum-based ones)

**If you don't have media keys**, you can simulate them by these commands:

`xdotool keyup alt keyup super keyup a key XF86AudioPlay` - play/pause, where you must add `keyup [key]` for all keys of your hotkey (this example is for super+alt+a)

`xdotool keyup alt keyup super keyup x key XF86AudioNext` - Next, example for super+alt+x

`xdotool keyup alt keyup super keyup z key XF86AudioPrev` - Prev, example for super+alt+z

#### Before v.0.7.9

This add-on listens for global media key presses on Linux via DBus and as such,
requires the ``glib``, ``gobject`` and ``gio`` shared libraries to be installed
and available to Firefox.  On Ubuntu, these can all be installed simultaneously
by installing the ``libglib2.0-0`` package, if not already installed.

This feature has been tested on Ubuntu 15.04 with Firefox 40.0a2.

Some desktop environments (Xfce, Openbox) uses DBus too, but they [can't work with media keys properly](https://bugzilla.xfce.org/show_bug.cgi?id=8588).
As a workaround, you can use [mediakeys-daemon script](https://github.com/nandhp/mediakeys-daemon/blob/master/src/mkd.py) to make needed DBus service:```./mkd.py -d```. Additionally you must use any keybinding app your DE have to run [mediakeys-daemon script](https://github.com/nandhp/mediakeys-daemon/blob/master/src/mkd.py) on media key press: 
```
  -p, --play      send play event to all listeners
  -a, --pause     send pause event to all listeners
  -s, --stop      send stop event to all listeners
  -n, --next      send next-track event to all listeners
  -b, --previous  send previous-track event to all listeners
```
If you don't have media keys and want to use hotkeys, you can use it too.

Development Environment
=======================

This add-on utilizes ``jpm``, the Jetpack Manager for Node.js, for building,
testing and packaging.  `npm install` will set it up for you provided you use the npm scripts included in package.json or have ./node_modules/.bin in your PATH.

More details about jpm can be found at https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm.


Testing
-------

```
You must setup the jpm_firefox_binary environment variable and point it to an install of Firefox Nightly, Unbranded, or Developer Edition in order to test add-ons.
https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Install_a_different_version_of_Firefox
```

To run all tests simply use the `npm test` command.

To start the browser test environment without running tests, use `npm run firefox`.

Pandora, Youtube and Spotify also can be launched in the test environment. e.g. `npm run pandora`

To test a media player that requires authentication we recommend using the instructions at https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Developing_without_browser_restarts

On Linux you can use `dbus-monitor --session` to debug DBus work.
