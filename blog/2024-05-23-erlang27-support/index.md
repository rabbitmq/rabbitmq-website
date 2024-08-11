---
title: "Erlang/OTP 27 Is Currently Not Supported"
tags: ["Announcements", "RabbitMQ 3.13.x"]
authors: [kura]
---

[Erlang/OTP 27.0 was released on May 20th, 2024](https://www.erlang.org/blog/highlights-otp-27/).
While it contains a lot of exciting features and improvements, unfortunately RabbitMQ currently
doesn't work well with this version.

<!-- truncate -->

Our team has discovered significant performance regressions on Erlang 27,
as high as 30% lower message throughput in many common workloads.

We are investigating the root cause of the regressions.
Please do not use Erlang/OTP 27 with RabbitMQ at this time.

We will announce support for Erlang/OTP 27 when we are confident that it works well with RabbitMQ.
