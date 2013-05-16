Release: RabbitMQ 3.1.1

Release Highlights
==================

server
------
bug fixes
25545 revert to treating missing x-match headers as "all" and
      relax validation for compatibility with brokers < 3.1.0
25546 fix bug where setting a prefetch count multiple times on the0
      same channel while there are active consumers, could lead
      to an internal error and crash report in the logs
25548 fix vhost validation when setting policies and/or parameters
25549 fix x-expires handling after last consumer disconnects
25555 fail validation of ha-params and ha-sync-mode unless ha-mode
      is enabled

shovel plugin
-------------
bug fixes
25542 fix handling of default reconnect_delay


management plugin
-----------------
bug fixes
25536 set auth header correctly when downloading definitions

federation-management-plugin
----------------------------
bug fixes
25556 allow multiple URIs to be specified against an upstream


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
