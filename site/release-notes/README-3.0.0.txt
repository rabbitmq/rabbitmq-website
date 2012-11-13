Release: RabbitMQ 3.0.0

Release Highlights
==================

server
------
bug fixes
- 25195 prevent slave being promoted before it has received all
        messages from dying master
- 25198, 25185, 25200 ensure "redelivered" flag set correctly on HA
        queue failover
- 25216 prevent excessive memory use when recovering large durable quuees
- 25226 prevent slaves leaking memory when using persistence and confirms
- 25202 fix race at slave startup causing process leak and other problems
- 25244 cope if clients set malformed "x-death" headers
- 24867 reject attempts to declare queues with x-expires or
        x-message-ttl greater than 2^32 milliseconds since this
        will not work
- 25053 ensure statistics event emission does not prevent fsync
- 24919 check flags passed to rabbitmqctl match the subcommand
- 25000 don't write a PID file when -detached is specified as it will
        not be right
- 25263 fix channel number in error message if rabbit_writer crashes
- 25260 ensure messages that expire while the broker is stopped are
        dead-lettered correctly
- 25215 ensure rapid declaration of many mirrored queues does not overload
        Mnesia

enhancements
- 24991 correctly enforce AMQP frame_max. Note that some buggy clients
        do not frame messages correctly; as of 3.0.0 these clients
        will be rejected if they attempt to send a message large than
        frame_max (by default 128k).
- 24914 rewrite of rabbitmqctl clustering commands for greater user
        friendliness
- 24908 allow queue mirroring to be defined by broker-wide policy, not
        queue declaration, and add "exactly" mode
- 25086 improve error reporting for framing errors
- 24196 dynamic runtime configuration mechanism (parameters)
- 24915 background GC for idle processes
- 25110 provide meaningful statistics on broker memory use
- 25227 provide information if a network partition has occurred
- 19376 support per-message TTL
- 24792 improve plugin startup procedure:
  - "rabbitmqctl wait" returns after plugins have started
  - Windows service users no longer need to reinstall service after
    enabling plugins
- 24719 ensure broker starts and rabbitmq-plugins works when plugin
        dependencies are missing
- 25164 give better error message when attempting to use a queue which
        is on a down node
- 25262 sort the output of rabbitmqctl list_*
- 23935 reverse DNS lookups for connection info items (disabled by default)
- 25193 expose count of non-blocked consumers as a queue info item
- 24998 make memory / disk alarms easier to spot in log files
- 24956 provide better log messages when heartbeat timeouts occur

feature removal
- 23896 remove support for AMQP's "immediate" publish mode

performance improvements
- 25145 greatly improve performance of mirrored queues
- 24974 improve performance of SSL when using HiPE compilation
- 24888 improve performance of bulk dead-lettering


packaging
---------
bug fixes
- 21413 follow specifications better for init script on RPM distros


management plugin
-----------------
bug fixes
- 23225 correctly display network traffic statistics for connections
  which do nothing but receive autoack messages
- 25220 allow bindings with arguments containing AMQP tables and arrays
- 25048 ensure queue synchronisation is always shown correctly

enhancements
- 24830 allow argument types to be selected in the web UI
- 24859 add global counts of various objects
- 24916 make the statistics database hibernate when idle
- 24932 improve responsiveness of the statistics database on a heavily
        loaded broker
- 24949 more flexible top-level navigation in the web UI
- 24983 clearer error message when rabbitmqadmin is run against
        an incompatible Python version
- 25148 clearer error message when the management port is in use at startup
- 25232 provide branded login screen and logout button
- 25135 show abbreviated client properties in web UI connection list
- 25151 fix sorting by and selection of queue/exchange arguments
- 24971 web UI help texts link to the website for mroe information
- 25149 move management port out of the ephemeral range
- 25209 make rabbitmqadmin work when passed through 2to3 (thanks to Alan
        Antonuk)
- 25218 make binding display on exchange/queue details page clearer
- 25259 simplify management listener configuration


federation plugin
-----------------
bug fixes
- 24856 prevent bindings from propagating too far and leaking in the
        presence of upstream cycles
- 25166 don't shut down slowly in the presence of packet loss
- 25244 cope if clients set malformed "x-received-from" headers
- 25022 don't crash on consumer cancellation notification

enhancements
- 23908 allow addition and removal of upstreams while the broker is running
- 24695	specify upstreams using amqp:// URIs
- 25029 improve consistency of federation nomenclature
- 23903 allow passing through user-id from trusted upstreams
- 24826 allow federation of normal exchanges, remove "x-federation" exchange
        type


old-federation plugin
---------------------
- 24822 new (old) plugin: a backported version of the federation
        plugin from 2.8.7.


shovel plugin
-------------
bug fixes
- 25166 don't shut down slowly in the presence of packet loss
- 25022 don't crash on consumer cancellation notification

enhancements
- 25049 don't depend on Erlando


STOMP plugin
------------
bug fixes
- 25045	don't drop subscriptions on consumer cancellation notification
- 25067 prevent header without colon from breaking all subsequent headers

enhancements
- 25196 set AMQP reply-to header sensibly when using temporary queues
- 25235 STOMP version 1.2 support
- 25036 log various flavours of authentication failure distinctly
- 25140 ensure all AMQP message properties are mapped to STOMP and vice-
        versa

performance improvements
- 24872 improve performance reading non-tiny messages from the socket
- 24968 improve perfromance reading large messages with content-length
        header


MQTT plugin
-----------
- 25025 new plugin: implement Message Queue Telemetry Transport version 3.1


Web-STOMP plugin
------------
- 24468 new plugin: STOMP to the browser over websockets with SockJS
        fallback


JSON-RPC channel plugin
-----------------------
enhancements
- 25282 ensure the plugin is dfsg-free
- 25149 move JSON-RPC port out of the ephemeral range
- 25259 simplify JSON-RPC listener configuration


LDAP plugin
-----------
bug fixes
- 25089 make {other_bind, as_user} work properly in non-AMQP contexts
        (management, STOMP, etc.)

enhancements
- 25169 allow use of in_group test when the attribute to be checked is
        not called "member"
- 24677 substantially improve logging for debugging LDAP queries


java client
-------------
bug fixes
- 20709 eliminate Javadoc warnings
- 24910 prevent DefaultExceptionHandler.handleChannelKiller from
        closing connection when it shouldn't

enhancements
- 24527 include an automated performance measuring tool (PerformanceMain)


.net client
-------------
bug fixes
- 25255 ensure BaseConnection#Dispose does not hang

enhancements
- 25092 set first failed connection as the inner exception to
        BrokerUnreachableException


erlang client
-------------
bug fixes
- 25108 fix connection supervision: amqp_connection_type_sup should not
        be transient

enhancements
- 25057 provide functions to unregister handlers
- 25034 remove some generically named -define()s from amqp_client.hrl


Upgrading
=========
To upgrade a non-clustered RabbitMQ from release 2.1.1 or later, simply install
the new version. All configuration and persistent message data is retained.

To upgrade a clustered RabbitMQ from release 2.1.1 or later, install the new
version on all the nodes and follow the instructions at
http://www.rabbitmq.com/clustering.html#upgrading .

To upgrade RabbitMQ from release 2.1.0, first upgrade to 2.1.1 (all data will be
retained), and then to the current version as described above.

When upgrading from RabbitMQ versions prior to 2.1.0, the existing data will be
moved to a backup location and a fresh, empty database will be created. A
warning is recorded in the logs. If your RabbitMQ installation contains
important data then we recommend you contact support at rabbitmq.com for
assistance with the upgrade.
