# Installing on Mac OS X

This guide will show you how to install and run RabbitMQ on your Mac
without the need to compile Erlang (whether manually or by using some
package manager like [Macports](install-macports.html) or
[Homebrew](install-homebrew.html)).

The steps will be:

- Download and install Erlang from a precompiled .dmg
- Download and install RabbitMQ from the tarball distribution
- Start the server

## Installing Erlang ##

One of the easiest ways to install Erlang these days is to use one of
the precompiled packages offered by Erlang Solutions. You can find
them on this
[page](https://www.erlang-solutions.com/downloads/download-erlang-otp).

From there, download the latest Mac OS X package and then follow the
installation instructions to get Erlang on your machine. Once you
installed it you can type `erl` on the Terminal to launch the Erlang
console. If all went well you should see something like this:

    $ erl
    Erlang R15B01 (erts-5.9.1) [source] [64-bit] [smp:8:8] [async-threads:0] [hipe] [kernel-poll:false]

    Eshell V5.9.1  (abort with ^G)
    1>

Quit the console by typing `q().` including that final dot.

## Downloading and Running RabbitMQ ##

Download the latest RabbitMQ release from here:
[rabbitmq-server-generic-unix-&version-server;.tar.gz](/releases/rabbitmq-server/v&version-server;/rabbitmq-server-generic-unix-&version-server;.tar.gz).

Then unpackage it with the following command:

    tar -xzvf rabbitmq-server-generic-unix-&version-server;.tar.gz

## Starting the Server ##

You can `cd` into the `rabbitmq_server-&version-server;` folder and
then run the following command to start the server:

    sbin/rabbitmq-server -detached

To stop the server type:

    sbin/rabbitmqctl stop

For more information on the Generic Unix release please read [its
installation instructions](install-generic-unix.html).
