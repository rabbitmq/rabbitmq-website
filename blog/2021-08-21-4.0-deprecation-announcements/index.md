---
title: "RabbitMQ Deprecation Announcements for 4.0"
tags: ["Announcements", ]
authors: [ebyford]
---

In RabbitMQ 4.0, we intend to remove some RabbitMQ features to:

* Increase the resiliency of the core broker
* Decrease the number of suboptimal configurations available
* Remove technical surface area (maintaining old code) from the team
* Reduce the support burden

We continually innovate to meet and exceed our users’ expectations. Removal of older functionality that no longer meets these expectations, or serves our users, means we can focus on our mission to provide a stable, performant, and flexible messaging system.

<!-- truncate -->
 
The features we are announcing the deprecation of have been chosen because (either):

* In certain conditions, they behave sub-optimally
* They are infrequently used

Given for each feature there is a newer, safer alternative to achieve the same outcome, we do not believe anyone should be using these functions.

This document is designed to explain the changes and allow a chance to provide feedback.

## When will these changes be made?

We intend to make these changes with the release of RabbitMQ 4.0. There is currently no timeline set for this release.

Before making the changes, we will review the feedback supplied via a survey.

## How can I provide feedback?

If you’d like to provide feedback on this announcement, please complete this [survey](https://docs.google.com/forms/d/e/1FAIpQLSfDjOigPhdd8z4l9DzSbHie0AfgAgsJESsQlvVOEAoDIYjzDA/viewform?usp=sf_link).

 
## The Announcements

### Disable metrics delivery via the management API / UI

#### Why are we making this decision?

The management API has been serving two functions: control plane and metrics delivery system. This dual purpose meant that in rare circumstances (i.e. extreme load) the metrics would be delayed.

#### What alternatives exist?

The Prometheus plugin, available since 3.8 was released in October 2019, provides metrics even under load. It also has the added benefit of offering a wider array of metrics than those available from management API. The documentation on the Prometheus and Grafana dashboards is [here](/docs/prometheus).

 

### Removal of global QoS

#### Why are we making this decision?

Global QoS, where a single shared prefetch is used for an entire channel, is not recommended practice.

#### What alternatives exist?

Per-consumer QoS (non-global) should be set instead.

 

### Removal of RAM nodes

#### Why are we making this decision?

RAM nodes hold all of their internal metadata in memory, including users, policies, queues, and RabbitMQ cluster membership. When a broker node is restarted, all of this will be lost, meaning that using RAM nodes in a highly available cluster is not recommended as it can result in data loss.

#### What alternatives exist?

Disk nodes should be used with fast storage.

 

### Removal of Classic Queue mirroring

#### Why are we making this decision?

Quorum Queues provide greater data safety as compared to classic mirrored queues.

#### What alternatives exist?

Customers should make use of Quorum Queues for replication and data safety. TTLs for classic mirrored queues can be replaced by streams.

 

### Removal of transient, non-exclusive queues

#### Why are we making this decision?

Transient queues are queues whose lifetime is linked to the uptime of the node they are declared on. In a single node cluster they are removed when the node is restarted. In a clustered environment they are removed when the node they are hosted on is restarted.
 

Correct use of transient queues requires that an application developer knows something about node uptime. Further, a node restart isn't a good way to remove unused queues.
 
There is one kind of transient queue that is not included in this deprecation; the exclusive queue. Exclusive queues are linked to the lifetime of the declaring connection which is something that an application developer can take into account and leverage.
 
By deprecating transient queues we are removing a potentially confusing queue option. We also reduce pressure on the boot procedure, as transient queues are currently removed on boot.

#### What alternatives exist?

Queue TTL should be used for auto-deleting unused, idle queues after some time of inactivity.

Exclusive queues: these are deleted once all connections to the queue are removed.

 
### No longer use fsync for publisher confirms with Classic Queues

#### Why are we making this decision?

Quorum Queues provide greater data safety as compared to using non-mirrored classic queues, regardless of the use of fsync. Calling fsync manually results in loss of performance compared to letting the kernel decide when to flush to disk.

#### What alternatives exist?

Customers should make use of Quorum Queues for replication and data safety.

## Thank you

Thank you for reading. If you have any thoughts on the above, please fill in our [survey](https://docs.google.com/forms/d/e/1FAIpQLSfDjOigPhdd8z4l9DzSbHie0AfgAgsJESsQlvVOEAoDIYjzDA/viewform?usp=sf_link) and let us know how you feel about the proposed changes!
