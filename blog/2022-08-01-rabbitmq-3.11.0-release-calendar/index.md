---
title: RabbitMQ 3.11.0 release calendar
tags: []
authors: [mgary]
---

We intend to release RabbitMQ 3.11.0 on 5 September 2022. While we have been testing
it internally for some time, with production-like workloads, we need your help to
check that it is as stable and reliable as we believe it is.

<!-- truncate -->

This is the timeline that we have to work together on making 3.11.0 the best release for
you:

| Milestone              | Anticipated Date | Notes                                                                         |
| ---                    | ---                | ---                                                                         |
| 3.11.0-beta.1 produced | 8 August 2022      | Feature preview of Single Active Consumer and Super Streams                 |
| Code freeze            | 19 August 2022     | No new features or refactorings before the final release                    |
| 3.11.0-rc.1 produced   | 19 August 2022     | All artefacts built & published                                             |
| 3.11.0-rc.1 announced  | 22 August 2022     | First release candidate (RC) is announced & made public for testing         |
| 3.11.0 produced        | 2 September 2022   | Final release is built & published                                          |
| 3.11.0 announced       | 5 September 2022   | Final release is announced & made public                                    |

The above release calendar is a point-in-time snapshot. For latest updates
please refer to the [Release Series](/release-information)
page.

RabbitMQ 3.11.0 introduces some highly requested functionality:
* [Single Active Consumer for Streams](https://blog.rabbitmq.com/blog/2022/07/05/rabbitmq-3-11-feature-preview-single-active-consumer-for-streams)
* [Super Streams](https://blog.rabbitmq.com/blog/2022/07/13/rabbitmq-3-11-feature-preview-super-streams)
* [Management UI OAuth2 and OIDC support](https://blog.rabbitmq.com/blog/2022/07/22/oidc-integration)

Additionally, RabbitMQ 3.11.0 will make [all feature flags introduced during the life of RabbitMQ 3.8.x required](https://blog.rabbitmq.com/blog/2022/07/22/mandatory-feature-flags-in-rabbitmq-3.11). Please ensure all feature flags are enabled before atttempting to upgrade to 3.11.0.

This release calendar is meant to communicate what to expect, and when.
Based on your feedback during the pre-release timeline, we may add additional
release candidates, and extend the release timeline.

Our intention is to give you the opportunity to find issues with this release
before we publish the final version. We all want important new releases, such
as 3.11.0, to be as stable and reliable as possible. While we have gone to great
lengths to ensure that this is the case, more eyes and experiments will always
help, especially with a community as experienced and battle-hardened as ours.

**Help us make RabbitMQ 3.11.0 the best release for you!**


## Intent to remove capabilities in RabbitMQ 4.0

We are intending to remove some aged and suboptimal capabilities of RabbitMQ (see [blog post here](/blog/2021/08/21/4.0-deprecation-announcements)).

We have not yet set a release date for 4.0.

If you have further comments, please complete the survey linked in the [blog post](/blog/2021/08/21/4.0-deprecation-announcements).
