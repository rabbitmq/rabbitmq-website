---
title: "SockJS 0.2 released!"
tags: ["Web Messaging", ]
authors: [marek]
---

![](sockjs-logo.png)

SockJS version 0.2 has been released:

* [https://groups.google.com/group/sockjs/browse_thread/thread/79893c8545c49f06](https://groups.google.com/group/sockjs/browse_thread/thread/79893c8545c49f06)

You can test it in the usual playground:

* [http://sockjs.popcnt.org/example-cursors.html](http://sockjs.popcnt.org/example-cursors.html)
* [http://sockjs.cloudfoundry.com/tests-qunit.html](http://sockjs.cloudfoundry.com/tests-qunit.html)

<!-- truncate -->

Apart from ton of general updates and few API tweaks, SockJS 0.2
contains two major features:

* Faster connection times - due to a better fallback-detection algorithm.
* Raw websocket api - should make it easier to write command line clients for SockJS.

That means two out of three updates to SockJS protocol [I proposed
about a month ago are done](https://groups.google.com/group/sockjs/browse_thread/thread/cd2b468d312bd5e1). The last major feature remaining is
binary data support.
Unfortunately [the releases rarely go smoothly](https://groups.google.com/group/sockjs/browse_thread/thread/4b0f3d426223ac0d), but thanks to
alert SockJS users the problem was quickly spotted and fixed.
So, happy playing with [SockJS](http://sockjs.org)!
