---
title: "What's Going on with the Ruby AMQP Gem?"
tags: ["Introductory", ]
authors: [botanicus]
---

In the past year development of the AMQP gem was practicaly stagnating, as its original author [Aman Gupta](https://github.com/tmm1) ([@tmm1](http://twitter.com/tmm1)) was busy. A lot of bugs stayed unresolved, the code was getting old and out-dated and no new features or documentation were made.

At this point I started to talk with the RabbitMQ guys about possible collaboration on this. Actually originally I contacted VMware when I saw [Ezra Zygmuntowicz](http://twitter.com/ezmobius) looking for people to his cloud team, but when I found that VMware recently acquired the RabbitMQ project in London, I got interested. I signed the contract, switched from `script/console` to Wireshark and the RabbitMQ Tracer and since November I've been happily hacking on the AMQP and AMQ-Protocol gems.

<!-- truncate -->

To introduce myself, my name's [Jakub Stastny](https://github.com/botanicus) ([@botanicus](http://twitter.com/botanicus)) and I work as a Ruby contractor. I contributed to such projects as RubyGems, Merb and rSpec and I wrote my own framework called [Rango](http://www.rubyinside.com/rango-ruby-web-app-framework-2858.html), the only Ruby framework with template inheritance. I work with Node.js as well and I created [Minitest.js](https://github.com/botanicus/minitest.js), BDD framework for testing asynchronous code. My other hobbies are [photography](http://www.flickr.com/photos/jakub-stastny/sets/72157625593607741) and travelling.

I asked Aman if I can take over the maintainership over the AMQP gem and he was happy to do so. At this point other two guys, Michael Klishin ([michaelklishin](https://github.com/michaelklishin)) and Ar Vicco ([arvicco](https://github.com/arvicco)) showed interest in the development, so we created [ruby-amqp organisation](https://github.com/ruby-amqp) at GitHub and forked the original code there, as well as a few other related repositories. The GitHub guys were happy to make our repository to be the main one, instead of just a fork, so since now, everything will be there (except the *old* issues which are still on tmm1's fork and which we want to solve and close soon).

## Soo What's New?

### Test Suite

At the beginning, there were barely any tests at all, so it was basically impossible to tell if the changes I made break something or not. So I started to write some. In the later stage, when michaelklishin and arvicco joined the development, we rewrote the few original Bacon specs to rSpec 2 and now arvicco is porting [his specs](https://github.com/ruby-amqp/amqp-spec) which he happened to write some time ago to the main repository. Arvicco has also written [amqp-spec](https://github.com/ruby-amqp/amqp-spec), superset of [em-spec](https://github.com/tmm1/em-spec) for testing the AMQP gem.

### AMQP 0.9.1

Currently the gem speaks only AMQP 0.8, which is more than 2 years old version, so probably the most important upcoming feature is support of AMQP 0.9.1. Because this is something what can be beneficial for other clients as well, I decided to create a new library called [AMQ-protocol](https://github.com/ruby-amqp/amq-protocol). It's using [rabbitmq-codegen](https://github.com/rabbitmq/rabbitmq-codegen) as many others client libraries.

One of the main goals of this gem is to be really fast and memory-efficient (not for the sake of memory-efficiency itself, but because the garbage collector of MRI[^1] is quite weak) MRI. I'm about to create some benchmarks soon to see if the performance is better and how much.

AMQ-Protocol is still work-in-progress. It works, but it still needs some polishing, refactoring and optimizations, as well as documentation and tests.

### Other Changes

I fixed a lot of bugs and I merged all the pending pull requests to the main repository. I'm going to write more about the changes once I'll release AMQP 0.7. I released 0.7.pre recently, you can try it by running `gem install amqp --pre`, which would be greatly appreciated. As the work on the test suite is still in progress now, the release process is kind of russian roulette at the moment.

## Backward compatibility

I fixed quite a few bugs and obviously the fixed code is never backward-compatible with the old buggy one. One of the major changes is that `MQ#queues` (as well as `MQ#fanouts` etc) is not a hash anymore, but an array-like collection with hash-like[^2] behaviour. It does NOT override anonymous instances when another anonymous instance is created (as it used to do before) and it does support server-generated names. So instead of `MQ#queues[nil] = <first instance>` and then `MQ#queues[nil] = <second instance>`) it now just adds both instances to the collection and when it receives `Queue.Declare-Ok` from the server, it updates the name to it.

## Future plans

The AMQP gem is very opinionated. If you don't want to use EventMachine, you're out of luck. You might want to use something more low-level like `IO.select` or just another async library like [cool.io](http://coolio.github.com). You might not even want to care about the asynchronous code at all.

It'd be great if we could have one really **un-opinionated AMQP client library** which only job would be to expose low-level API defined by the AMQP protocol without any abstraction like hidding channels etc. Such library would be intended for another library implementators rather than for the end users. AMQP is a complex protocol and because of some design decisions it's pretty hard to design a good and easy-to-use (opinionated) client library for it. So some basic library which doesn't make any assumptions would help others to play around and try to implement their own, opinionated libraries on top of this one without the need to manually implement the hard stuff like encoding/decoding or basic socket communication.

## Questions? Ideas? Get in touch!

Are you interested in the AMQP gem development? Do you want to participate or do you have some questions? Feel free to contact me, either by comments under this blog post, or you can drop me an e-mail to [stastny@101ideas.cz](mailto:stastny@101ideas.cz) or drop by to Jabber MUC[^3] room at **amqp-dev@conf.netlab.cz** where all the current maintainers usually are. And for all the news make sure you are following me on [Twitter](http://twitter.com/botanicus)!

[^1]: Matz Ruby Implementation, the original and most widely-used Ruby implementation
[^2]: Or is the adjective hash-ish?
[^3]: Multi user chat
