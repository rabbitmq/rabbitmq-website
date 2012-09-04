# Installing Erlang and RabbitMQ on Mac OS X #

This guide will show you how to install and run RabbitMQ on your Mac without the need to compile Erlang (whether manually or by using some package manager like Macports or Homebrew).

The steps will be:

- Download an install Erlang from a precompiled .dmg
- Download a tarball distribution of RabbitMQ
- Unpack the tarball and start the server

## Installing Erlang ##

One of the easiest ways to install Erlang these days is to use on of the precompiled packages offered by Erlang Solutions. You can find them on this [page](https://www.erlang-solutions.com/downloads/download-erlang-otp). From there we will download the latest one that works on our platform (Mac in our case). At the time of this writing this is the [latest Erlang release for Mac](https://elearning.erlang-solutions.com/couchdb/rbingen/package_R15B01_niecmac_1337391510/esl-erlang-R15B01-1.x86_64.dmg).

Download that package and then follow the installation instructions to get Erlang on your machine. Once you installed it you can type `erl` on the Termianl to launch the Erlang console. If all went well you should see something like this:

    $ erl
    Erlang R15B01 (erts-5.9.1) [source] [64-bit] [smp:8:8] [async-threads:0] [hipe] [kernel-poll:false]

    Eshell V5.9.1  (abort with ^G)

Quit the console by typing `q().` including that finall dot.

## Dowloading and Running RabbitMQ ##

Then to install and run RabbitMQ simply download the Generic Unix version from the RabbitMQ [downloads page](http://www.rabbitmq.com/download.html).

At the time of this writing the latest RabbitMQ release is _2.8.6_. Download it from here [rabbitmq-server-generic-unix-2.8.6.tar.gz](http://www.rabbitmq.com/releases/rabbitmq-server/v2.8.6/rabbitmq-server-generic-unix-2.8.6.tar.gz).

Then unpackage it with the following command:

    tar -xzvf rabbitmq-server-generic-unix-2.8.6.tar.gz

You can `cd` into the `rabbitmq_server-2.8.6` folder and then run the following command to start the server:

    sbin/rabbitmq-server -detached

To stop the server type:

    sbin/rabbitmqctl stop

For more information on the Generic Unix Release please read the following webpage: (http://www.rabbitmq.com/install-generic-unix.html)[http://www.rabbitmq.com/install-generic-unix.html].
