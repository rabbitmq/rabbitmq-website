---
title: installing Additional Plugins
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Installing Additional Plugins

## Overview {#overview}

This guide describes installation of 3rd party plugins.
For an overview of the plugin mechanism, plugin activation and
the list of tier 1 (core) plugins, see the [main Plugins guide](./plugins).


## Installing 3rd Party Plugins {#installing-custom-plugins}

Any plugins that do not ship with the server will need to be
installed. Plugins are distributed as .ez archives (which are zip files with metadata).
The files must be copied to one of the plugins
directories specified by <span class="envvar">$RABBITMQ_PLUGINS_DIR</span>.

Assuming that plugins correctly specify a dependency on the core RabbitMQ server
and their files were copied to the correct directory, they will show up in
`rabbitmq-plugins list` and can be enabled with
`rabbitmq-plugins enable`. This is covered the [Plugins guide](./plugins).

The plugins directory location is determined by the `RABBITMQ_PLUGINS_DIR`> environment variable.
Its [default location](./relocate) depends on how RabbitMQ was installed. Some common values are:

<table>
  <tr>
    <th>Installation method</th>
    <th>Plugins directory</th>
  </tr>
  <tr>
    <th>Debian and RPM packages</th>
    <td>
      <code>/usr/lib/rabbitmq/plugins</code> and <code>/usr/lib/rabbitmq/lib/rabbitmq_server-{<i>version</i>}/plugins</code>.
      <p>
        <code>/usr/lib/rabbitmq/plugins</code> is an additional
        directory where nothing is installed by the RabbitMQ
        package itself. But it is a fixed non-changing path
        where external plugins can be installed from Debian/RPM
        packages or can be put there by a provisioning tool.
      </p>
    </td>
  </tr>
  <tr>
    <th>Windows</th>
    <td>
      Typically <code>C:\Program Files\RabbitMQ\rabbitmq_server-{<i>version</i>}\plugins</code>
      (depending on RabbitMQ installation path)
    </td>
  </tr>
  <tr>
    <th>Homebrew</th>
    <td>
      <code>/usr/local/Cellar/rabbitmq/{<i>version</i>}/plugins</code>
    </td>
  </tr>
  <tr>
    <th>Generic Binary build</th>
    <td>
      <code>rabbitmq_server-{<i>version</i>}/plugins</code>
      (depending on RabbitMQ installation path)
    </td>
  </tr>
</table>


## Plugins and Upgrades {#upgrades}

The enabled plugins configuration is preserved between
upgrades, so there is no need to re-enable plugins after an
upgrade, but because the plugins directory changes between
versions, any third party plugins will need to be copied to
the new directory. It's very possible that due to API
changes non-tier 1 plugins will have to be upgraded to be compatible
with the new version of the RabbitMQ server.


## Building Plugins {#building}

It is possible to build RabbitMQ plugins from source.  The sources for a
particular version of the plugins is distributed in the same
archive as the broker with that version.  The source code
repositories can all be found on [GitHub](https://github.com/rabbitmq).

See the [plugin development](/plugin-development) guide for more information on building plugins from source.

Note that plugin releases might have dependencies to a particular
version of RabbitMQ server, or at least the tip of a specific branch.

For example, if RabbitMQ version is `3.12.13` check out all plugins with the Git tag `v3.12.13` or the `v3.12.x` branch.
