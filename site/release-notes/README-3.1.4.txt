Release: RabbitMQ 3.1.4

Release Highlights
==================

server
------
bug fixes

25624 fix bug in HA/mirrored queue handling of discarded messages
      (since 2.0.0)
25615 fix bug in HA/mirrored queue recovery when multiple nodes restart
      simultaneously
25649 fix hipe compilation on R16B01 (reported by Thomas Riccardi)
25659 allow offline cluster node removal with a node which is not second
      from last (since 3.0.0)
25670 fix race condition in HA/mirrored queues when no master is detected
      and causing slave promotion to fail
25645 fix bug causing HA/mirrored queue sync to fail in the presence of
      un-acked messages which are not at the head of the queue
      (since 3.1.0)
25640 fix race condition that could lead to crashes when channels using a
      low prefetch count successively send basic.consume and basic.cancel
      (since 3.1.0) (reported by Morgan Nelson)
25625 fix resource leak in HA/mirrored queue master handling of discarded
      messages (since 2.6.0)
25638 fix resource leak when whole clusters stop and the last node to go
      down is an HA/mirrored queue slave (since 3.0.0)
25631 fix bug in shutdown sequence that could lead to spurious
      INTERNAL_ERRORs being sent to clients (since 3.1.0)
25651 improve `rabbitmqctl cluster_status' handling of partition info when
      cluster nodes are in the process of stopping (since 3.1.0)
25648 make `rabbitmqctl join_cluster' idempotent (since 3.0.0)


erlang client
-------------
bug fixes

25632 fix broken error handling in amqp_network_connection that could lead
      to a crash during broker shutdown (since 2.4.0)
25688 fix bug in challenge-response auth handling (since 2.6.0)


management plugin
-----------------
bug fixes

24803 update to a later version of mochiweb that fixes a security vulnerability
      allowing arbitrary file access on Windows (reported by Zach Austin)


build and packaging
-------------------
bug fixes

25668 add ssl support to OS-X standalone package (reported by Alan Antonuk)
25584 ensure that VERSION is set correctly when building src packages
      (since 3.1.0)
25642 fix mercurial tagging of non-plugin repositories (since 3.1.0)

