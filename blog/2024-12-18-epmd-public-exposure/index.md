---
title: "Exposed EPMD: A Hidden Security Risk"
tags: ["Security"]
authors: [eef]
---

## Exposed EPMD: A Hidden Security Risk

The Erlang Port Mapper Daemon (EPMD) is a built-in component that helps Erlang-based applications (including RabbitMQ) discover each other’s distribution ports for clustering. Although EPMD itself isn’t directly dangerous, its exposure on the public internet often signals that Erlang Distribution ports are also exposed. This creates a serious security risk: if attackers find these distribution ports, they can potentially join your cluster, run arbitrary code, and compromise your systems. Recent scans have revealed over 85,000 instances of publicly accessible EPMD, with roughly half associated with RabbitMQ servers.

If left unsecured, exposed Erlang Distribution ports let attackers gain a foothold in your system. Fortunately, mitigation steps are straightforward: disable Erlang Distribution if you’re not clustering, or restrict it behind a firewall and proper network configuration—and ensure Erlang Distribution is never exposed to untrusted networks.

Read the full article on the [EEF blog](https://erlef.org/blog/eef/epmd-public-exposure).