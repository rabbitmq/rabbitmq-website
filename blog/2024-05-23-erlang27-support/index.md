---
title: "Erlang/OTP 27 Is Currently Not Supported"
tags: ["Announcements", "RabbitMQ 3.13.x"]
authors: [kura]
---

[Erlang/OTP 27.0 was released on May 20th, 2024](https://www.erlang.org/blog/highlights-otp-27/).
While it contains a lot of exciting features and improvements, unfortunately RabbitMQ currently
doesn't work well with this version. We are aware of significant performance regressions,
as high as 30% lower message throughput in many common workloads.

We are invistigating the root cause of this regression.
Please do not use Erlang/OTP 27 with RabbitMQ at this time.

We will announce support for Erlang/OTP 27 when we are confident that it works well with RabbitMQ.
