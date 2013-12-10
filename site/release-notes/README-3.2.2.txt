Release: RabbitMQ 3.2.2

Release Highlights
==================

server
------
bug fixes
25867 automatic synchronisation could previously result in slaves being
      unsynchronised when started soon after a policy-initiated master shutdown
25870 prevent the worker pool from running out of processes due to processes
      crashing
25873 prevent possibility of deadlock when slaves start up
25899 prevent possible failure during cluster upgrade, after second node is
      started
25912 correct reporting of flow control when connections become idle

enhancements
25901 cluster upgrade failures can now produce an exception instead of halt


LDAP plugin
-----------
bug fixes
25863 prevent possibility of channels crashing during broker shutdown


management plugin
-----------------
bug fixes
25872 prevent empty idle queues from disappearing from the management view
25889 GET /api/overview previously used different data types depending on
      whether server was idle
25920 prevent rabbitmqadmin failure when no home directory is set


Erlang client
-----------------
bug fixes
25881 prevent race condition if client and server both close the channel


MQTT plugin
-----------
bug fixes
25887 prevent possible error in the presence of multiple client IDs
25905 fix handling of acks from the broker with the 'multiple' flag set


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
