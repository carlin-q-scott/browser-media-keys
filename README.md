Build Status
============

| Linux | Windows |
|-------|---------|
| [![Linux Build Status](https://travis-ci.org/carlin-q-scott/browser-media-keys.svg?branch=master)](https://travis-ci.org/carlin-q-scott/browser-media-keys) | [![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/carlin-q-scott/browser-media-keys)](https://ci.appveyor.com/project/carlin-q-scott/browser-media-keys) |


Description
==================

Lets you control Youtube, Pandora, Bandcamp, TidalHiFi and Google Play Music
website media players using the media keys on your keyboard.

If you're not using Windows or compatible Linux environment, then this plugin
requires that a browser window is active.

Support on Linux
---------------------

####After v.1.0
Now this add-on uses XCB to capture key presses.

If you don't have media keys, you can simulate them by add hotkeys to these commands:

`xdotool keyup alt keyup super keyup a key XF86AudioPlay` - play/pause, where you must add `keyup [key]` for all keys on which you added hotkey (this example is for super+alt+a)

`xdotool keyup alt keyup super keyup x key XF86AudioNext` - Next, example for super+alt+x

`xdotool keyup alt keyup super keyup z key XF86AudioPrev` - Prev, example for super+alt+z

####Before v.0.7.9

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

Building and testing
--------------------

This add-on utilises ``jpm``, the Jetpack Manager for Node.js, for building,
testing and packaging.  Follow instructions at
https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm for installation and
use.  Of particular note, see the *Developing without browser restarts* section
as testing certain online media players require authentication.

On Linux you can use ```dbus-monitor --session``` to debug DBus work.

