---
title: "Brand new rabbitmqctl in 3.7.0"
tags: ["New Features", ]
authors: [dfedotov]
---

As of [v3.7.0 Milestone 8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_7_0_milestone8),
RabbitMQ ships with a brand new set of CLI tools (`rabbitmqctl`, `rabbitmq-plugins`, and more), reworked from the ground-up. We had a few goals with this project.

<!-- truncate -->

We wanted to use a more user-friendly command line parser and produce more useful help and error messages.

* CLI tools should be extensible from plugins: plugins such as management, federation, shovel, trust store all have functions that are meant to be invoked by CLI tools but the only way of doing it was `rabbitmqctl eval`, which is error prone and can be dangerous.
* We wanted to give [Elixir](http://elixir-lang.org) a try on a real project and make it easier for developers new to Erlang to extend the CLI functionality.
* Our CLI tools historically didn't have good test coverage; the new ones should (and do).
* CLI tools should be able to produce machine-friendly formats, be it JSON, CSV or something else; there was no internal infrastructure for doing that in the original implementation.
* CLI tools should be a separate repository just like all plugins, client libraries, and so on.

Nine months later the experiment was declared a success and integrated into RabbitMQ distribution.

Please give [v3.7.0 Milestone 8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_7_0_milestone8) a try and take a look at [how easy it is to extend the CLI](https://github.com/rabbitmq/rabbitmq-cli/blob/master/COMMAND_TUTORIAL.md).

There's also a [longer document](https://github.com/rabbitmq/rabbitmq-cli/blob/master/DESIGN.md) that covers new features and implementation decisions.
