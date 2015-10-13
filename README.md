browser-media-keys [![Linux Build Status](https://travis-ci.org/carlin-q-scott/browser-media-keys.svg?branch=master)](https://travis-ci.org/carlin-q-scott/browser-media-keys)
==================

Lets you control Youtube, Pandora, Bandcamp, TidalHiFi and Google Play Music
website media players using the media keys on your keyboard.

If you're not using Windows or compatible Linux environment, then this plugin
requires that a browser window is active.

DBus support on Linux
---------------------

This add-on listens for global media key presses on Linux via DBus and as such,
requires the ``glib``, ``gobject`` and ``gio`` shared libraries to be installed
and available to Firefox.  On Ubuntu, these can all be installed simultaneously
by installing the ``libglib2.0-0`` package, if not already installed.

This feature has been tested on Ubuntu 15.04 with Firefox 40.0a2.

Building and testing
--------------------

This add-on utilises ``jpm``, the Jetpack Manager for Node.js, for building,
testing and packaging.  Follow instructions at
https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm for installation and
use.  Of particular note, see the *Developing without browser restarts* section
as testing certain online media players require authentication.


