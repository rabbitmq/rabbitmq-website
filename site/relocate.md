<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# File and Directory Locations

## <a id="overview" class="anchor" href="#overview">Overview</a>

Every RabbitMQ node uses a number of files and directories
to load configuration: store data, metadata, log files, and so on.
Their location can be changed.

This guide covers:

  * How to customise location of various directories and files used RabbitMQ nodes
  * Default locations of key files and directories on various operating systems
  * Other topics related to file and directory locations

This guide accompanies the main [Configuration guide](configure.html).

## <a id="locations" class="anchor" href="#locations">Overriding Locations</a>

A number of [environment variables](configure.html) specifies where
RabbitMQ should locate certain things. In most environments default
values should work just fine.

### <a id="directory-and-path-restrictions" class="anchor" href="#directory-and-path-restrictions">Path and Directory Name Restrictions</a>

Some of the environment variable configure paths and locations (node's base or data directory, [plugin source and expansion directories](./plugins.html),
and so on). Those paths have must exclude a number of characters:

 * `*` and `?` (on Linux, macOS, BSD and other UNIX-like systems)
 * `^` and `!`
 * `[` and `]`
 * `{}` and `}`

The above characters will render the node unable to start or function as expected (e.g. load plugin code modules and other files).

### <a id="file-permissions" class="anchor" href="#file-permissions">Required File and Directory Permissions</a>

When changing file or directory locations, it is important to
make sure that they have sufficient permissions for RabbitMQ
node OS process to read and write from. It's best to assume
that most directories and files used by RabbitMQ require read,
write, and file creation permissions.

[Debian](./install-debian.html),
[RPM](./install-rpm.html), [Homebrew](./install-homebrew.html) and [Windows installer](./install-windows.html) packages
will set up file system permissions suitable for most
environments, however, when strict default permissions are
used system-wide, it may be necessary to run additional
configuration steps after installation to make sure RabbitMQ node
file and directories have sufficient permissions


## <a id="environment-variables" class="anchor" href="#environment-variables">Environment Variables</a>

<table>
  <th>Name</th><th>Description</th>
  <tr>
    <td>RABBITMQ_BASE</td>
    <td>
      <b>Note:</b> Windows-specific. This base directory contains
      sub-directories for the RabbitMQ server's database and
      log files. Instead of overriding
      <b>RABBITMQ_MNESIA_BASE</b> and
      <b>RABBITMQ_LOG_BASE</b> individually,
      it may be easier to override the base directory instead.
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      The path to the configuration file, without
      the <code>.config</code> extension. If
      the <a href="configure.html#configuration-files">configuration
      file</a> is present it is used by the server to configure
      RabbitMQ components. See <a href="./configure.html">Configuration guide</a>
      for more information.
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_CONFIG_FILES</td>
    <td>
      Path to a directory of RabbitMQ configuration files in the new-style (.conf) format.
      The files will be loaded in alphabetical order. Prefixing each files with a number
      is a common practice. See <a href="./configure.html">Configuration guide</a>
      for more information.
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      This base directory contains sub-directories for the RabbitMQ
      server's node database, message store and cluster state files, one for each node,
      unless <b>RABBITMQ_MNESIA_DIR</b> is set explicitly.
      It is important that effective RabbitMQ user has sufficient permissions
      to read, write and create files and subdirectories in this directory
      at any time.
      This variable is typically not overridden. Usually <code>RABBITMQ_MNESIA_DIR</code> is overridden instead.
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      The directory where this RabbitMQ node's data is stored. This includes
      a schema database, message stores, cluster member information and other
      persistent node state.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SCHEMA_DIR</td>
    <td>
      The directory where RabbitMQ keeps its configuration schema used by
      the <a href="./configure.html#configuration-files">new style configuration file</a>.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOG_BASE</td>
    <td>
      This base directory contains the RabbitMQ server's <a href="./logging.html">log
      files</a>, unless <b>RABBITMQ_LOGS</b> is set.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOGS</td>
    <td>
      The path of the RabbitMQ server's Erlang log file. This
      variable cannot be overridden on Windows.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      The list of directories where <a
      href="./plugins.html">plugin</a> archive files are located and extracted
      from. This is <code>PATH</code>-like variable, where
      different paths are separated by an OS-specific separator
      (<code>:</code> for Unix, <code>;</code> for Windows).
      Plugins can be <a href="./plugins.html#plugin-directories">installed</a> to any of the
      directories listed here.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      Working directory used to <a href="./plugins.html#plugin-expansion">expand enabled plugins</a> when starting
      the server. It is
      important that effective RabbitMQ user has sufficient permissions
      to read and create files and subdirectories in this directory.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ENABLED_PLUGINS_FILE</td>
    <td>
      This file records explicitly enabled plugins. When a plugin
      is enabled or disabled, this file will be recreated. It is
      important that effective RabbitMQ user has sufficient permissions
      to read, write and create this file at any time.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PID_FILE</td>
    <td>
      File in which the process id is placed for use by
      <code>rabbitmqctl wait</code>.
    </td>
  </tr>
</table>


## <a id="unix" class="anchor" href="#unix">Default Locations on Linux, macOS, BSD</a>

In the following table the `${install_prefix}` to
some paths is indicated. Debian and RPM package installations use an empty
`${install_prefix}`.

[Homebrew installations](/install-homebrew.html) use the
**installation-prefix** (Homebrew Cellar) when installed. By
default this is `/opt/homebrew` on Apple Silicon-based Macs.

<table>
  <th>Name</th><th>Location</th>
  <tr>
    <td>RABBITMQ_BASE</td>
    <td>
      (Not used - Windows only)
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      <span class="path"><span class="envvar">${install_prefix}</span>/etc/rabbitmq/rabbitmq</span>
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      <span class="path"><span class="envvar">${install_prefix}</span>/var/lib/rabbitmq/mnesia</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span></span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOG_BASE</td>
    <td>
      <span class="path"><span class="envvar">${install_prefix}</span>/var/log/rabbitmq</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOGS</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_LOG_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span>.log</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      <span class="path">/usr/lib/rabbitmq/plugins:<span class="envvar">$RABBITMQ_HOME</span>/plugins</span>
      <p>
        <small>
          Note that <span class="path">/usr/lib/rabbitmq/plugins</span>
          is used only when RabbitMQ is <a href="installing-plugins.html">installed</a>
          into the standard (default) location.
        </small>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span>-plugins-expand</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ENABLED_PLUGINS_FILE</td>
    <td>
      <span class="path"><span class="envvar">${install_prefix}</span>/etc/rabbitmq/enabled_plugins</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PID_FILE</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_DIR</span>.pid</span>
    </td>
  </tr>
</table>


## <a id="windows" class="anchor" href="#windows">Default Locations on Windows</a>

<table>
  <th>Name</th><th>Location</th>
  <tr>
    <td>RABBITMQ_BASE</td>
    <td>
      <span class="path"><span class="envvar">%APPDATA%</span>\RabbitMQ</span>
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_BASE%</span>\rabbitmq</span>
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_BASE%</span>\db</span>
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_MNESIA_BASE%</span>\<span class="envvar">%RABBITMQ_NODENAME%</span>-mnesia</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOG_BASE</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_BASE%</span>\log</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOGS</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_LOG_BASE%</span>\<span class="envvar">%RABBITMQ_NODENAME%</span>.log</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      <i>Installation-directory</i><span class="path">/plugins</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_MNESIA_BASE%</span>\<span class="envvar">%RABBITMQ_NODENAME%</span>-plugins-expand</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ENABLED_PLUGINS_FILE</td>
    <td>
      <span class="path"><span class="envvar">%RABBITMQ_BASE%</span>\enabled_plugins</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PID_FILE</td>
    <td>(Not currently supported)</td>
  </tr>
</table>


## <a id="binary-build" class="anchor" href="#binary-build">Generic Binary Build Defaults</a>

These are the defaults obtained when a generic binary build
archive is unpacked without any modification. In
this table <span class="envvar">$RABBITMQ_HOME</span> refers
to the directory produced when extracting the archive.

These paths are not relevant for installation options that use the same package type but heavily
customize it, such as the [Homebrew formula](/install-homebrew.html).

<table>
  <th>Name</th><th>Location</th>
  <tr>
    <td>RABBITMQ_BASE</td>
    <td>
      (Not used)
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq</span>
    </td>
  </tr>
  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_HOME</span>/var/lib/rabbitmq/mnesia</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span></span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOG_BASE</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_HOME</span>/var/log/rabbitmq</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOGS</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_LOG_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span>.log</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_HOME</span>/plugins</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_BASE</span>/<span class="envvar">$RABBITMQ_NODENAME</span>-plugins-expand</span>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PID_FILE</td>
    <td>
      <span class="path"><span class="envvar">$RABBITMQ_MNESIA_DIR</span>.pid</span>
    </td>
  </tr>
</table>
