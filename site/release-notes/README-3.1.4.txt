Release: RabbitMQ 3.1.4

Release Highlights
==================

server
------
bug fixes
25638 fix resource leak with mirrored queues when whole clusters stop
      (since 3.0.0)
25624 fix queue crash in mirrored queue handling of messages during promotion
      (since 2.6.0)
25615 25670 fix race conditions in mirrored queues when different cluster
      nodes start and stop near-simultaneously (since 2.6.0)
25645 fix mirrored queue sync failure in the presence of un-acked messages
      not at the head of the queue (since 3.1.0)
25640 fix race condition leading to channel crash with low prefetch count
      repeated basic.consume and basic.cancel (since 3.1.0)
25625 fix memory leak of mirrored queue messages during promotion
      (since 2.6.0)
25649 allow hipe compilation on Erlang R16B01
25659 allow offline cluster node removal with a node which is not second
      from last (since 3.0.0)
25648 make `rabbitmqctl join_cluster' idempotent (since 3.0.0)
25651 improve `rabbitmqctl cluster_status' handling of partition info when
      cluster nodes are in the process of stopping (since 3.1.0)
25631 fix bug in shutdown sequence that could lead to spurious
      INTERNAL_ERRORs being sent to clients (since 3.1.0)


erlang client
-------------
bug fixes
25632 fix broken error handling in amqp_network_connection that could lead
      to a crash during broker shutdown (since 2.4.0)
25688 fix bug in challenge-response auth handling (since 2.3.0)


management plugin
-----------------
bug fixes
24803 update to a later version of mochiweb that fixes a security vulnerability
      allowing arbitrary file access on Windows


build and packaging
-------------------
bug fixes
25668 add ssl support to OS X standalone package
25584 ensure that VERSION is set correctly when building src packages
      (since 2.7.0)
