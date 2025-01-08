---
title: Plugin Development Basics
---
<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Plugin Development Basics

This guide covers the basics of RabbitMQ plugin development. It is expected that
before reading this guide, the reader has a basic understanding of the RabbitMQ plugin mechanism.

Readers are also expected to have a basic understanding of [Erlang](https://www.erlang.org)
and the [OTP design principles](http://www.erlang.org/doc/system_principles/users_guide.html).

[Learn You Some Erlang](https://learnyousomeerlang.com) is a great way to get
started with Erlang and OTP.


## Why Develop a Plugin? {#pros}

Writing a RabbitMQ plugin provides a number of appealing possibilities:

 * Enable your application to access internal RabbitMQ functionality that is not exposed
   via one of the supported protocols.
 * Running in the same Erlang VM as the broker may increase performance for certain workloads.
 * Plugins can implement features that otherwise would have to be implemented by every application
   (service) in the system, creating duplication and increasing maintenance load


## Why To Not Develop a Plugin {#cons}

As with any plugin mechanism, consideration should be given when developing functionality as to whether
embedding it as a plugin is the most appropriate path to take. Some reasons that you might not want to
develop your functionality as a plugin:

 * Depending on internal RabbitMQ APIs can result in your application requiring changes when
   new RabbitMQ come out, including patch releases. If you can do what you need to do without
   using RabbitMQ internals, then your application will be far more forward-compatible
 * A poorly written plugin can result in the **entire node becoming unavailable** or misbehaving


## Getting Started {#getting-started}

To develop a RabbitMQ plugin, first make sure the following
requirements are met:

 * Ensure that you have a working installation of [Git](http://git-scm.com/)
 * Ensure that the dependencies detailed in the [Server Build](/docs/build-server#prerequisites) guides are installed and functional

[Erlang.mk](http://erlang.mk) is used to
build RabbitMQ and its plugins. The easiest way to start on
a new plugin is probably to copy an existing plugin such as
<tt>rabbitmq-metronome</tt>, <a href="#plugin-hello-world">used
as an example below</a>.


## Activating Plugins During Development {#installing-plugins-during-development}

To test the plugin during development, use the following make target to start
a RabbitMQ node with the local plugin built from source and enabled:

```bash
make run-broker
```


## Plugin Quality Tips {#plugin-quality-tips}

A badly-written plugins can pose a risk to the stability of the broker.
To ensure that your plugin can safely operate without affecting RabbitMQ core,
a couple of safety best practices are highly recommended.

1. Always use a top-level supervisor for your application.
1. Never start the plugin application directly,
   instead opting to create a (possibly quite trivial) supervisor that will prevent the Erlang VM from
   shutting down due to a crashed top-level application.


## Broker and Dependency Version Constraints {#plugin-version-constraints}

It's possible to specify broker and dependency version
requirements for a plugin using the
<code>broker_version_requirements</code> key in plugin's
application environment. The requirements are specified as a list of
minimum version in each release series.
Consider the following example:

```erlang
{application, my_plugin,[
    %% ...
    {broker_version_requirements, ["3.11.15", "3.10.22"]}
]}
```

The above requires RabbitMQ
3.10.x starting with 3.10.22 and 3.11.x starting with 3.11.15.
Note that when new major and minor (feature) RabbitMQ versions
come out, **it is necessary for plugin maintainers to update the list**.


Plugins can have dependencies. It is possible to specify supported
version series for dependencies, too. This is quite similar
to the above but uses a dictionary-like data structure (proplist).

For example:

```erlang
{application, my_plugin, [
    %% ...
    {dependency_version_requirements, [{rabbitmq_management, ["3.11.0", "3.10.22"]}]}
]}
```

means the plugin depends on `rabbitmq_management` 3.10.x starting
with 3.10.22 and all versions in the 3.11.x series.


## Example Plugin: Metronome {#plugin-hello-world}

Seeing as no development guide would be complete without a Hello World example, the following tries to
provide the basics of how your would build your very own RabbitMQ plugin.

The following example details how you might build a simple plugin that acts like a metronome.

Every second, it fires a message that has a routing key in the form `yyyy.MM.dd.dow.hh.mm.ss` to a topic exchange called &quot;metronome&quot; by default.
Applications can attach queues to this exchange with various routing keys in order to be invoked at regular intervals.
For example, to receive a message every second, a binding of &quot;*.*.*.*.*.*.*&quot; could be applied. To receive
a message every minute, a binding of &quot;*.*.*.*.*.*.00&quot; could be applied instead.

The [rabbitmq-metronome](https://github.com/rabbitmq/rabbitmq-metronome) repository on GitHub
contains a copy of the code for this plugin.

The following table should explain the purpose of the various files in the repository.

<table>
  <tr>
    <th>Filename</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/Makefile"><code>Makefile</code></a></td>
    <td>
      This top-level Makefile defines the name
      of your plugin and its dependencies. The
      name must match the Erlang application name.
      Dependencies are declared using erlang.mk's
      variables. Just after that, the Makefile includes
      <tt>rabbitmq-components.mk</tt> and <tt>erlang.mk</tt>,
      as well as <tt>rabbitmq-plugins.mk</tt> using erlang.mk
      plugins facility. See below for a description of those
      files.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/erlang.mk"><code>erlang.mk</code></a></td>
    <td>
      A local copy of <tt>erlang.mk</tt>. This is not a vanilla
      copy because RabbitMQ relies on a few modifications
      which have not been merged upstream at the time of
      this writing. That's why <tt>ERLANG_MK_REPO</tt> and
      <tt>ERLANG_MK_COMMIT</tt> are overridden for now.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/rabbitmq-components.mk"><code>rabbitmq-components.mk</code></a></td>
    <td>
      A local copy of <tt>rabbitmq-components.mk</tt>. The
      original file is in <tt>rabbitmq-common</tt> which your
      plugin will depend on automatically. It contains other
      erlang.mk extensions and helpers which must be defined
      before <tt>erlang.mk</tt> inclusion. This file must be
      kept up-to-date w.r.t. <tt>rabbitmq-common</tt>: when it
      is out-of-date, you will get the following error:
      ```
      error: rabbitmq-components.mk must be updated!
      ```
      In this case, just run the following command to update
      your copy:
      ```
      make rabbitmq-components-mk
      ```
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/priv/schema/rabbitmq_metronome.schema"><code>rabbitmq_metronome.schema</code></a></td>
    <td>
      A <a href="https://github.com/Kyorai/cuttlefish">Cuttlefish</a> configuration schema.
      Used to translate <a href="/docs/configure#configuration-files">configuration file</a>
      to the internal format used by RabbitMQ and its runtime.

      Metronome schema contains mappings for the <code>metronome.exchange</code> setting,
      setting the exchange used by the plugin.

      Configuration will be regenerated when the plugin is
      enabled. Plugin-specific values in the config will cause error if
      plugin has not been enabled.

      More information about writing schema files can be found
      <a href="https://github.com/basho/cuttlefish/wiki/Cuttlefish-for-Erlang-Developers">in the Cuttlefish docs</a>.

    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/src/rabbit_metronome.erl"><code>src/rabbit_metronome.erl</code></a></td>
    <td>
      Implementation of the Erlang "application" behaviour. Provides a means for the Erlang VM to start and
      stop the plugin.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/src/rabbit_metronome_sup.erl"><code>src/rabbit_metronome_sup.erl</code></a></td>
    <td>
      Implementation of the Erlang "supervisor" behaviour. Monitors the worker process and restarts it if
      it crashes.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/src/rabbit_metronome_worker.erl"><code>src/rabbit_metronome_worker.erl</code></a></td>
    <td>
      The core of the plugin. The worker will connect internally to the broker, then create a task that
      will be triggered every second.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-metronome/blob/master/test/metronome_SUITE.erl"><code>test/metronome_SUITE.erl</code></a></td>
    <td>
      Automated tests for the plugin.
    </td>
  </tr>
</table>


## Development Process

Run make to build the plugin:

```bash
make
```

To start a node with the plugin built and enabled on:

```bash
make run-broker
```

To ensure that the new plugin is up and running, run the following command:

```bash
rabbitmq-diagnostics status
```

If your plugin has loaded successfully, you should see it in the enabled plugin list:

```bash
# => Plugins
# =>
# => Enabled plugin file: /var/folders/gp/53t98z011678vk9rkcb_s6ph0000gn/T/rabbitmq-test-instances/rabbit@warp10/enabled_plugins
# => Enabled plugins:
# =>
# =>  * rabbitmq_metronome
# =>  * amqp_client
```

To run Common Test test suites, use

```bash
make tests
```

Finally, you can produce an <code>.ez</code> file, suitable for distribution with:

```bash
DIST_AS_EZS=yes make dist
```

The file appears in the <tt>plugins</tt> directory under repository root.
