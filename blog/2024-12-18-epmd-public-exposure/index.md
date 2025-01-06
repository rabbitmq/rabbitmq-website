---
title: "Security Best Practices: epmd"
tags: ["security"]
authors: [eef]
---

## Security Best Practices: epmd

The Erlang Port Mapper Daemon (`epmd`) is a built-in component that helps Erlang-based applications (including RabbitMQ) discover each other’s distribution ports.
Together with DNS for hostname resolution, `epmd` is a piece of infrastructure RabbitMQ nodes rely on for clustering, inter-node communication
and CLI tools connectivity.

While `epm` is very limited in scope, its exposure to the public Internet often means that Erlang distribution ports are also exposed.
This creates a potential security risk: if attackers find these distribution ports, they'd be one secret value away from being able to run
CLI commands against the node (or cluster).

Recent scans have revealed over 85,000 instances of publicly accessible `epmd`, with roughly half associated with RabbitMQ servers.

Fortunately, all it usually takes to mitigate this risk is limiting network access to a range of ports. `epmd` and inter-node communication
can also be limited to local network interfaces, in particular for single node clusters used for running tests.

Read the full article on the [Erlang Ecosystem Foundation blog](https://erlef.org/blog/eef/epmd-public-exposure).