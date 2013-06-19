Release: RabbitMQ 3.1.2

Release Highlights
==================

server
------
bug fixes

25571 fix potential deadlock application shutdown handling
25567 fix bug in handling re-queued, un-acked messages residing
      in memory could cause the queue to crash
25599 fix bug preventing exclusive durable queues from being redeclared
      after forceful shutdown, which could additionally lead to leaking
      the durable queue entries in mnesia
25576 fix bug in queue index, where a broker crash between segment
      deletion and journal truncation could prevent recovery
25588 ensure per-message-TTL is removed when messages are dead-lettered
25575 fix bug in handling empty rabbit serial that lead to startup errors
25611 improve stack traces when message store crash occurs
25612 fix bug in shutdown sequence that could lead to crashing processes
      when the stopping node is part of a cluster
25573 fix bug in access control causing LDAP auth plugin to fail
      when the broker is compiled against Erlang/OTP R12B-5


stomp plugin
-------------
bug fixes
25564 fix handling of reply-to for non-temporary queue destinations
25566 allow unescaped colons in header values


management plugin
-----------------
bug fixes
25592 fix bug allowing users to see stats for all vhosts
25600 fix consumer record leak in the management database
25580 fix bug preventing definitions file from loading if it contained
      a policy from a non default vhost


Erlang client
-------------
bug fixes
25521 fix negotiated frame-max handling, which was being ignored
25489 fix rpc client/server to ensure correlation-ids are valid UTF-8 strings


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
