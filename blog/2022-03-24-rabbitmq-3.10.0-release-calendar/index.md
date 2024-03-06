---
title: RabbitMQ 3.10.0 release calendar
tags: []
authors: [mgary, ebyford]
---

We intend to release RabbitMQ 3.10.0 on 11 April 2022. While we have been testing
it internally for some time, with production-like workloads, we need your help to
check that it is as stable and reliable as we believe it is.

<!-- truncate -->

This is the timeline that we have to work together on making 3.10.0 the best release for
you:

| Milestone             | Anticipated Date | Notes                                                                         |
| ---                   | ---              | ---                                                                           |
| Code freeze           | 24 March 2022    | No new features or refactorings before the final release                      |
| 3.10.0-rc.1 produced  | 24 March 2022    | All artefacts built & published                                               |
| 3.10.0-rc.1 announced | 25 March 2022    | First release candidate (RC) is announced & made public for testing           |
| 3.10.0-rc.3 produced  | 7 April 2022     | All artefacts built & published                                               |
| 3.10.0-rc.3 announced | 8 April 2022     | Second release candidate (RC) is announced & made public for testing          |
| 3.10.0-rc.4 produced  | 24 April 2022    | If new issues are reported, a new RC with fixes is made available for testing |
| 3.10.0-rc.5 produced  | 28 April 2022    | If new issues are reported, a new RC with fixes is made available for testing |
| 3.10.0-rc.6 produced  | 30 April 2022    | If new issues are reported, a new RC with fixes is made available for testing |
| 3.10.0 produced       | 3 May 2022       | Final release is built & published                                            |
| 3.10.0 announced      | 9 May 2022       | Final release is announced & made public                                      |

The above release calendar is a point-in-time snapshot. For latest updates
please refer to the [Release Series](/release-information)
page.

RabbitMQ 3.10.0 introduces some highly requested functionality for quorum queues:
* [Quorum Queue Message TTL](/docs/quorum-queues#feature-matrix)
* [Quorum Queue At-Least-Once Dead Lettering](/docs/quorum-queues#dead-lettering)

Additionally, there are performance improvements to both classic queues and quorum queues.

This release calendar is meant to communicate what to expect, and when.
Based on your feedback during the pre-release timeline, we may add additional
release candidates, and extend the release timeline.

Our intention is to give you the opportunity to find issues with this release
before we publish the final version. We all want important new releases, such
as 3.10.0, to be as stable and reliable as possible. While we have gone to great
lengths to ensure that this is the case, more eyes and experiments will always
help, especially with a community as experienced and battle-hardened as ours.

**Help us make RabbitMQ 3.10.0 the best release for you!**


## Intent to remove capabilities in RabbitMQ 4.0

We are intending to remove some aged and suboptimal capabilities of RabbitMQ (see [blog post here](/blog/2021/08/21/4.0-deprecation-announcements)).

RabbitMQ 3.10 works towards this removal by improving feature parity between Classic Mirrored Queues and Quorum Queues.

We have not yet set a release date for 4.0.

If you have further comments, please complete the survey linked in the [blog post](/blog/2021/08/21/4.0-deprecation-announcements).
