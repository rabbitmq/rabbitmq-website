Release: RabbitMQ 3.2.3

Release Highlights
==================

server
------
bug fixes
25945 fixed queue federation error when channels close or crash without
      cancellation from consumers
25936 stemmed leak when queues with active consumers terminate
25928 fixed error when sending connection.close-ok after client already closed
      the connection
25965 prevent large messages from causing a crash in clusters by limiting to 2Gb
24927 avoid broker being overwhelmed while logging benign messages starting with
      "Discarding messages"
25952 prevent VM panic when sending many/large messages on a very fast network
25925 removed extraneous service parameters when installing on windows


federation plugin
-----------------
bug fixes
25956 prevent federation of internal exchanges
25949 prevent unnecessary CPU use when ACKs are not in use


shovel plugin
-----------------
bug fixes
25934 remove ordering constraint on configuration items
25949 prevent unnecessary CPU use when ACKs are not in use


LDAP plugin
-----------
bug fixes
25914 fix error caused by post-bind lookup of distinguishedName on OpenLDAP


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
