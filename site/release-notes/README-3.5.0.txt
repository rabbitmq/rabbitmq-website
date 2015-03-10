Release: RabbitMQ 3.5.0

Release Highlights
==================

server
------
bug fixes
26477 Only send 'user_authentication_success' event if
      rabbit_reader:auth_phase/2 accepts the user (since 3.3.0)
26622 Ensure channels don't deliver confirms when a pause mode lasts (since
      3.3.5)
26628 When using autoheal, ensure the leader waits for the winner to finish
      the autoheal process (since 3.3.0)
26631 Work around a possible hang in Erlang's "global" (since 3.4.2)
26614 Ensure rabbitmqctl.bat exits with code 1 if ERLANG_HOME is incorrect
26426 Ensure epmd is running on Windows, even if the user who executed
      rabbitmq* commands logged out.
26463 Ensure new mirrors are started when old ones go down if ha-mode=exactly
      is being used (since 3.4.0)
26467 Fix promotion of offline slaves, in particular if the slave crashed
      (since 3.4.0)
26527 Ensure GM's memory consumption remains limited by adding flow control
26595 Fix a crash when querying SSL certificate info while the connection is
      closing (since 2.1.1)
26610 Restore the timeout error message while waiting for other cluster nodes
      (since 3.4.0)
26636 Fix inconsistencies and hangs when a node comes back online before its
      disappearance is fulled treated

enhancements
26393 Add more info to "user_authentication_*" events
26427 Silence connection errors from load balancer sanity checks
26465 New "pause_if_all_down" partition handling mode
26471 Log when HiPE is enabled
26615 Notify systemd when RabbitMQ is started, if "sd_notify" is available
25430 Further limit queue's journal size to avoid excessive memory use
26183 Move priority queues from an external plugin to the broker
26327 Embed messages smaller than a configurable size in the queue index
26444 Improve performance parsing AMQP tables / arrays
26457 Add read buffer cache to improve on-disk messages consumption
26469 Support separate authentication/authorization backends
26475 Add "rabbitmqctl rename_cluster_node"
26545 Prohibit deletion of amq.* exchanges
26543 Improve I/O performance by reading or writing several file segments
      in one operation
26602 Add routing decision information to firehose messages
26603 Improve unacked messages requeueing performance in priority queues

feature removal
26257 Remove support for the legacy (2.x compatible) form of the
      "cluster_nodes" configuration directive


management plugin
-----------------
bug fixes
26613 Fix exception on the node details page if the node goes
      online or offline while viewing (since 3.4.0)

enhancements
26522 Provide statistics about accesses to message store and queue index
24781 Provide statistics about file I/O
24700 Support if-unused and if-empty for queue / exchange deletion
24921 rabbitmqadmin: Support Python 3
25652 Add a "move messages" UI
26561 Show per-queue disk message read/write rates
26598 Show cross-cluster networking statistics
26621 Display a warning when the management database is overloaded


LDAP plugin
-----------
bug fixes
26601 Ensure tag_queries respects other_bind setting


MQTT plugin
-----------

enhancements
26278 Support authentication via SSL certificate


Web-STOMP plugin
----------------
enhancements
26504 Add configuration parameter for cowboy connection pool size


tracing plugin
--------------
enhancements
26619 Improve how logs are written to disk to increase performance
26620 Allow tracing plugin to truncate message bodies to increase performance


java client
-----------
bug fixes
26576 Make sure Channel#abort ignores IOExceptions as the docs say

enhancements
26571 Undeprecate QueueingConsumer
26617 Dynamically calculate number of consumer work service executor threads

feature removal
26007 Remove deprecated ConnectionFactory#getNumConsumerThreads,
      ConnectionFactory#setNumConsumerThreads, BasicProperties setters (in
      favour of BasicProperties.Builder) and Channel#recoveryAsync


.net client
-----------
bug fixes
26508 Synchronise SessionManager Count method (since 3.3.5)

enhancements
24699 Add a unit test to ensure channels are notified when a connection is
      closed
26329 Dispatch consumer methods concurrently
26420 Move the .NET guide to www.rabbitmq.com
26459 Use timer for heartbeats to reduce the number of threads and memory
      consumption
26483 Add ISubscription and IQueueingBasicConsumer interfaces
26505 Upgrade to Visual Studio 2013 project files
26507 Use a static exchange types array instead of creating a new list each
      time (since 3.3.5)
26509 Switch to auto-properties (since 3.3.5)
26510 Use a separate lock object in BlockingCell (since 3.3.5)
26511 Assorted doc string and member name prefix changes (since 3.3.5)
26512 Use EventHandler<T> and similar instead of homebrew event handler
      classes (since 3.3.5)
26513 Improve how authentication method names and URI schemas are compared in
      ConnectionFactory (since 3.3.5)
26514 Use TryParse instead of Parse in PrimitiveParser (since 3.3.5)
26534 Remove MSI installer
26550 Support TLS connections without client certificates


building and packaging
----------------------
bug fixes
26524 Improve error message when build dependencies are missing on Mac OS X
      (since 3.1.0)
26525 Do not install rabbitmq.config.example if DOC_INSTALL_DIR is unset
      (since 3.2.0)
26526 Replace GNU patch specific "--no-backup-if-mismatch" by a portable
      combination of patch(1) and find(1) (since 3.4.0)
26539 Use "exec" to run rabbitmq-server in rabbitmq-script-wrapper to ensure
      signals are correctly propagated (since 2.8.3)
