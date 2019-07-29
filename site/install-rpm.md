<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Installing on RPM-based Linux (RedHat Enterprise Linux, CentOS, Fedora, openSUSE)

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ installation on Debian, Ubuntu and distributions based on one of them.

RabbitMQ is included in standard Fedora and RHEL repositories. However, the versions included are
usually outdated and [out of support](/versions.html).

There are two ways to install the most recent version of RabbitMQ:

 * Installing the package using Yum repositories on [Package Cloud](#package-cloud) or [Bintray](#bintray) (this option is highly recommended)
 * [Downloading](#downloads) the package and installing it with `rpm`. This option will require manual installation of all [package dependencies](#package-dependencies).

The following guide focuses on RabbitMQ installation on RPM-based distributions
such as Fedora, RHEL and CentOS. It covers a number of topics:

 * Package installation from Yum repositories on [Package Cloud](#package-cloud) or [Bintray](#bintray)
 * How to install a [latest supported Erlang/OTP version](#install-erlang)
 * [Package dependencies](#package-dependencies)
 * [Supported distributions](#supported-distributions)
 * [Privilege requirements](#sudo-requirements)
 * [Package downloads](#downloads)
 * How to [manage the service](#managing-service)
 * How to [inspect node and service logs](#server-logs)

and more.


## <a id="overview" class="anchor" href="#overview">Overview</a>

The package is distributed via Yum repositories on [PackageCloud](https://packagecloud.io/rabbitmq/rabbitmq-server/)
and [Bintray](https://bintray.com/rabbitmq/rpm/rabbitmq-server).

`rabbitmq-server` is included in Fedora. However,
the versions included often lag behind RabbitMQ releases.
It is recommended that you use Yum repositories from [PackageCloud](https://packagecloud.io/rabbitmq/rabbitmq-server/)
or [Bintray](https://bintray.com/rabbitmq/rpm/rabbitmq-server).

Check the [Fedora
package](https://admin.fedoraproject.org/updates/rabbitmq-server) details for which version of the server is
available for which versions of the distribution.


## <a id="supported-distributions" class="anchor" href="#supported-distributions">Supported Distributions</a>

Below is a list of supported RPM-based distributions as of RabbitMQ 3.6.3:

 * CentOS 7.x and 6.x (there are two separate RPM packages for each series)
 * RedHat Enterprise Linux 7.x and 6.x (same packages as for CentOS)
 * Fedora 23 through 30 (use the CentOS 7.x package)

The packages may work on other RPM-based distributions
if [dependencies](#package-dependencies) are satisfied but their testing and support
is done on a best effort basis.


## <a id="sudo-requirements" class="anchor" href="#sudo-requirements">User Privilege Requirements</a>

RabbitMQ RPM package will require `sudo` privileges to install and manage.
In environments where `sudo` isn't available, consider using the
[generic binary build](/install-generic-unix.html).

## <a id="install-erlang" class="anchor" href="#install-erlang">Install Erlang</a>

Before installing RabbitMQ, you must install a [supported version](/which-erlang.html) of Erlang/OTP.
There are three commonly used sources for Erlang packages on RPM-based distributions.

 * Team RabbitMQ produces [a package](https://github.com/rabbitmq/erlang-rpm) stripped
   down to only provide those components needed to run
   RabbitMQ. It might be easiest to use if installing Erlang's dependencies is proving difficult.
 * [Erlang Solutions](https://www.erlang-solutions.com/resources/download.html) produces packages that are usually reasonably up to
   date and involve installation of a potentially excessive list of dependencies.
 * [EPEL](http://fedoraproject.org/wiki/EPEL) ("Extra Packages
   for Enterprise Linux"); part of the Red Hat/Fedora organisation,
   provides many additional packages, including Erlang. These are the
   most official packages but tend to be out of date.
   The packages are split into many small pieces.
 * [openSUSE](https://www.opensuse.org/) produces Erlang packages for each distribution (openSUSE and SLES)

### <a id="install-zero-dependency-rpm" class="anchor" href="#install-zero-dependency-rpm">Zero-dependency Erlang from RabbitMQ</a>

[Zero dependency Erlang RPM package for running RabbitMQ](https://github.com/rabbitmq/erlang-rpm) can be
installed via Yum repositories [on Bintray](https://bintray.com/rabbitmq-erlang/rpm/erlang) and [Package Cloud](https://packagecloud.io/rabbitmq/erlang)
as well as a direct download.

As the name suggests, the package strips off some Erlang modules and dependencies
that are not essential for running RabbitMQ.

### <a id="install-from-suse-repository" class="anchor" href="#install-from-suse-repository">Erlang packages from openSUSE</a>

openSUSE package repositories provide Erlang so it can be installed using Zypper:

<pre class="sourcecode bash">
sudo zypper in erlang
</pre>

Erlang versions available in the standard repositories will in practice be behind the most recent version.
To use the last version with the newest features, add the
[openSUSE Factory repositories for Erlang](http://download.opensuse.org/repositories/devel:/languages:/erlang:/Factory/):

<pre class="sourcecode bash">
# add the openSUSE erlang factory, obs:// extracts the http url for the matching distro.
sudo zypper ar -f  obs://devel:languages:erlang:Factory openSUSE-Erlang-Factory

# import the signing key and refresh the repository
sudo zypper --gpg-auto-import-keys refresh

# install a recent Erlang version
sudo zypper in erlang
</pre>

### <a id="install-from-esl-repository" class="anchor" href="#install-from-esl-repository">Erlang Yum Repository from Erlang Solutions</a>

Follow the instructions under "Installation using repository"
at [Erlang Solutions](https://www.erlang-solutions.com/resources/download.html).
Note that Erlang Solutions tend to provide cutting edge Erlang versions that may or may not
be [supported by RabbitMQ](/which-erlang.html). Version locking (see below) is recommended
when Erlang installed using this option.

### <a id="install-monolithic-from-esl-repository" class="anchor" href="#install-monolithic-from-esl-repository">Monolithic Erlang Package from Erlang Solutions</a>

Download and install the [appropriate](/which-erlang.html) `esl-erlang` RPM
from [Erlang Solutions](https://www.erlang-solutions.com/resources/download.html).

### <a id="install-erlang-from-epel-repository" class="anchor" href="#install-erlang-from-epel-repository">Erlang package from the EPEL Repository</a>

Follow the steps in the [EPEL FAQ](http://fedoraproject.org/wiki/EPEL/FAQ#howtouse) to enable EPEL on the target
machine, then run the following command as root:

<pre class="lang-bash">
yum install erlang
</pre>

### <a id="rpm-version-locking" class="anchor" href="#rpm-version-locking">Package Version Locking in Yum</a>

[yum version locking](https://access.redhat.com/solutions/98873) plugin is recommended
to prevent unwanted Erlang upgrades. This is highly recommended when Erlang is installed
via the Erlang Solutions repository.


## <a id="package-dependencies" class="anchor" href="#package-dependencies">Package Dependencies</a>

When installing with Yum, all dependencies other than Erlang/OTP should be resolved and installed automatically
as long as compatible versions are available. When that's not the case, dependency packages must be installed manually.

However, when installing a local RPM file via `yum` dependencies must be installed
manually. The dependencies are:

 * `erlang`: a [supported version of Erlang](/which-erlang.html) can installed from a number of [repositories](#install-erlang)
 * `socat`
 * `logrotate`


## <a id="install-rabbitmq" class="anchor" href="#install-rabbitmq">Install RabbitMQ Server</a>

### <a id="package-cloud" class="anchor" href="#package-cloud">Using PackageCloud Yum Repository</a>

A Yum repository with RabbitMQ packages is available from PackageCloud.

A quick way to install is to use a [Package Cloud-provided script](https://packagecloud.io/rabbitmq/rabbitmq-server/install#bash-rpm).
Package Cloud also can be used to [install a recent Erlang version via yum](https://packagecloud.io/rabbitmq/erlang/install#bash-rpm).

There are more installation options available:

 * Using PackageCloud Chef cookbook
 * Using PackageCloud Puppet module
 * Manually

See [PackageCloud RabbitMQ repository instructions](https://packagecloud.io/rabbitmq/rabbitmq-server/install).

Package Cloud signs distributed packages using their own GPG keys.
As of late 2018 Package Cloud is undergoing a signing key migration. Instead of relying on a "master key",
projects will migrate to use repository-specific signing keys. Before the migration is completed,
both old and new key must be imported for forward compatibility:

<pre class="lang-bash">
# import the new PackageCloud key that will be used starting December 1st, 2018 (GMT)
rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey

# import the old PackageCloud key that will be discontinued on December 1st, 2018 (GMT)
rpm --import https://packagecloud.io/gpg.key
</pre>

After importing both keys please follow the [Package Cloud](https://packagecloud.io/rabbitmq/rabbitmq-server/install) repository
setup instructions.

### <a id="bintray" class="anchor" href="#bintray">Using Bintray Yum Repository</a>

A Yum repository with RabbitMQ packages is [available from Bintray](https://bintray.com/rabbitmq/rpm/rabbitmq-server). The package page provides a repository
setup help section.

Bintray also can be used to [install a recent Erlang version via yum](https://bintray.com/rabbitmq-erlang/rpm/erlang).

Before the Yum repository can be used, [RabbitMQ signing key](/signatures.html) must be imported first.
This makes RPM tools trust the signature on the packages provided in the repository. To do so,
run `rpm --import` as a superuser:

<pre class="lang-bash">
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
</pre>

In order to use the Yum repository, a `.repo` file (e.g. `rabbitmq.repo`) has to be
added under the `/etc/yum.repos.d/` directory. The contents of the file will vary slightly
between distributions (e.g. CentOS 7 vs. CentOS 6 vs. OpenSUSE).
The following example targets CentOS 7:

<pre class="lang-bash">
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.7.x/el/7/
gpgcheck=0
repo_gpgcheck=0
enabled=1
</pre>

On CentOS 6 the `baseurl` line would be slightly different:

<pre class="lang-bash">
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.7.x/el/6/
gpgcheck=0
repo_gpgcheck=0
enabled=1
</pre>

The following example targets OpenSUSE:

<pre class="lang-bash">
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.7.x/opensuse/42.1/
gpgcheck=0
repo_gpgcheck=0
enabled=1
</pre>

The following example targets SLES 11.x:

<pre class="lang-bash">
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.7.x/sles/11
gpgcheck=0
repo_gpgcheck=0
enabled=1
</pre>

### <a id="with-rpm" class="anchor" href="#with-rpm">With rpm and Downloaded RPM</a>

After downloading the server package, issue the following command as
'root':

<pre class="lang-bash">
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
# this example assumes the CentOS 7 version of the package
yum install rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el7.noarch.rpm
</pre>

[RabbitMQ public signing key](/signatures.html) can also be [downloaded from rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<pre class="lang-bash">
rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc
# this example assumes the CentOS 7 version of the package
yum install rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el7.noarch.rpm
</pre>

## <a id="downloads" class="anchor" href="#downloads">Download the Server</a>

In some cases it may easier to download the package and install it manually. The package can be downloaded
from [GitHub](https://github.com/rabbitmq/rabbitmq-server/releases).

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      RPM for RHEL Linux 7.x, CentOS 7.x, Fedora 19+ (supports systemd)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el7.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el7.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el7.noarch.rpm.asc">Signature</a>
    </td>
  </tr>

  <tr>
    <td>
      RPM for RHEL Linux 6.x, CentOS 6.x, Fedora prior to 19
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el6.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el6.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el6.noarch.rpm.asc">Signature</a>
    </td>
  </tr>

  <tr>
    <td>
      RPM for openSUSE Linux
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm.asc">Signature</a>
    </td>
  </tr>

  <tr>
    <td>
      RPM for SLES 11.x
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.sles11.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.sles11.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.sles11.noarch.rpm.asc">Signature</a>
    </td>
  </tr>
</table>


## <a id="running-rpm" class="anchor" href="#running-rpm">Run RabbitMQ Server</a>

### Start the Server

The server is not started as a daemon by default when the
RabbitMQ server package is installed. To start the daemon by default
when the system boots, as an administrator run

<pre class="lang-bash">
chkconfig rabbitmq-server on
</pre>

As an administrator, start and stop the
server as usual:

<pre class="lang-bash">
/sbin/service rabbitmq-server start

/sbin/service rabbitmq-server stop
</pre>


## <a id="configuration" class="anchor" href="#configuration">Configuring RabbitMQ</a>

On most systems, a node should be able to start and run with all defaults.
Please refer to the [Configuration guide](configure.html) to learn more
and [Production Checklist](/production-checklist.html) for guidelines beyond
development environments.

Note: the node is set up to run as system user `rabbitmq`.
If [location of the node database or the logs](/relocate.html) is changed,
the files and directories must be owned by this user.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
Make sure the following ports are accessible:

 * 4369: [epmd](http://erlang.org/doc/man/epmd.html), a peer discovery service used by RabbitMQ nodes and CLI tools * 5672, 5671: used by AMQP 0-9-1 and 1.0 clients without and with TLS
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](/federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](/networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](/networking.html) for details.
 * 15672: [HTTP API](/management.html) clients, [management UI](/management.html) and [rabbitmqadmin](/management-cli.html)
   (only if the [management plugin](/management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](/stomp.html) is enabled)
 * 1883, 8883: ([MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](/mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](/web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](/web-mqtt.html) is enabled)

It is possible to [configure RabbitMQ](/configure.html)
to use [different ports and specific network interfaces](/networking.html).


## <a id="default-user-access" class="anchor" href="#default-user-access">Default User Access</a>

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. <strong>By default, these credentials can only be
used when connecting to the broker as localhost</strong> so you
will need to take action before connecting from any other
machine.

See the documentation on [access
control](access-control.html) for information on how to create more users and delete
the `guest` user.


## <a id="kernel-resource-limits" class="anchor" href="#kernel-resource-limits">Controlling System Limits on Linux</a>

RabbitMQ installations running production workloads may need system
limits and kernel parameters tuning in order to handle a decent number of
concurrent connections and queues. The main setting that needs adjustment
is the max number of open files, also known as `ulimit -n`.
The default value on many operating systems is too low for a messaging
broker (`1024` on several Linux distributions). We recommend allowing
for at least 65536 file descriptors for user `rabbitmq` in
production environments. 4096 should be sufficient for many development
workloads.

There are two limits in play: the maximum number of open files the OS kernel
allows (`fs.file-max`) and the per-user limit (`ulimit -n`).
The former must be higher than the latter.

### <a id="max-open-files-limit" class="anchor" href="#max-open-files-limit">With systemd (Recent Linux Distributions)</a>

On distributions that use systemd, the OS limits are controlled via
a configuration file at `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`.
For example, to set the max open file handle limit (`nofile`) to `64000`:

<pre class="lang-ini">
[Service]
LimitNOFILE=64000
</pre>

See [systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) to learn about
the supported limits and other directives.

### With Docker

To configure kernel limits for Docker contains, use the `"default-ulimits"` key in [Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).
The file has to be installed on Docker hosts at `/etc/docker/daemon.json`:

<pre class="lang-json">
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
</pre>

### Without systemd (Older Linux Distributions)

The most straightforward way to adjust the per-user limit for
RabbitMQ on distributions that do not use systemd is to edit the `/etc/default/rabbitmq-server`
(provided by the RabbitMQ Debian package) or [rabbitmq-env.conf](http://www.rabbitmq.com/configure.html)
to invoke `ulimit` before the service is started.

<pre class="lang-bash">
ulimit -S -n 4096
</pre>

This <em>soft</em> limit cannot go higher than the <em>hard</em> limit (which defaults to 4096 in many distributions).
[The hard limit can be increased](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) via
`/etc/security/limits.conf`. This also requires enabling the [pam_limits.so](http://askubuntu.com/a/34559) module
and re-login or reboot. Note that limits cannot be changed for running OS processes.

For more information about controlling `fs.file-max`
with `sysctl`, please refer to the excellent
[Riak guide on open file limit tuning](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md#debian--ubuntu).

### <a id="verifying-limits" class="anchor" href="#verifying-limits">Verifying the Limit</a>

[RabbitMQ management UI](management.html) displays the number of file descriptors available
for it to use on the Overview tab.

<pre class="lang-bash">rabbitmqctl status</pre>

includes the same value.

The following command

<pre  class="lang-bash">
cat /proc/$RABBITMQ_BEAM_PROCESS_PID/limits
</pre>

can be used to display effective limits of a running process. `$RABBITMQ_BEAM_PROCESS_PID`
is the OS PID of the Erlang VM running RabbitMQ, as returned by `rabbitmqctl status`.

### <a id="chef-puppet-bosh" class="anchor" href="#chef-puppet-bosh">Configuration Management Tools</a>

Configuration management tools (e.g. Chef, Puppet, BOSH) provide assistance
with system limit tuning. Our [developer tools](devtools.html#devops-tools) guide
lists relevant modules and projects.


## <a id="managing-service" class="anchor" href="#managing-service">Managing the Service</a>

To start and stop the server, use the `service` tool.
The service name is `rabbitmq-server`:

<pre class="lang-bash">
# stop the local node
sudo service rabbitmq-server stop

# start it back
sudo service rabbitmq-server start
</pre>

`service rabbitmq-server status` will report service status
as observed by systemd (or similar service manager):

<pre class="lang-bash">
# check on service status as observed by service manager
sudo service rabbitmq-server status
</pre>

It will produce output similar to this:

<pre class="lang-ini">
Redirecting to /bin/systemctl status rabbitmq-server.service
● rabbitmq-server.service - RabbitMQ broker
   Loaded: loaded (/usr/lib/systemd/system/rabbitmq-server.service; enabled; vendor preset: disabled)
  Drop-In: /etc/systemd/system/rabbitmq-server.service.d
           └─limits.conf
   Active: active (running) since Wed 2018-12-26 10:21:32 UTC; 25s ago
 Main PID: 957 (beam.smp)
   Status: "Initialized"
   CGroup: /system.slice/rabbitmq-server.service
           ├─ 957 /usr/lib/erlang/erts-10.2/bin/beam.smp -W w -A 64 -MBas ageffcbf -MHas ageffcbf -MBlmbcs 512 -MHlmbcs 512 -MMmcs 30 -P 1048576 -t 5000000 -stbt db -zdbbl 128000 -K true -- -root /usr/lib/erlang -progname erl -- -home /var/lib/rabbitmq -- ...
           ├─1411 /usr/lib/erlang/erts-10.2/bin/epmd -daemon
           ├─1605 erl_child_setup 400000
           ├─2860 inet_gethost 4
           └─2861 inet_gethost 4

Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##      RabbitMQ 3.7.16. Copyright (c) 2007-2019 Pivotal Software, Inc.
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Licensed under the MPL.  See http://www.rabbitmq.com/
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ######  ##
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: Starting broker...
Dec 26 10:21:32 localhost.localdomain rabbitmq-server[957]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 10:21:32 localhost.localdomain systemd[1]: Started RabbitMQ broker.
Dec 26 10:21:32 localhost.localdomain rabbitmq-server[957]: completed with 6 plugins.
</pre>

`rabbitmqctl`, `rabbitmq-diagnostics`,
and other [CLI tools](/cli.html) will be available in `PATH` and can be invoked by a `sudo`-enabled user:

<pre class="lang-bash">
# checks if the local node is running and CLI tools can successfully authenticate with it
sudo rabbitmq-diagnostics ping

# prints enabled components (applications), TCP listeners, memory usage breakdown, alarms
# and so on
sudo rabbitmq-diagnostics status

# prints effective node configuration
sudo rabbitmq-diagnostics environment

# performs a more extensive health check of the local node
sudo rabbitmq-diagnostics node_health_check
</pre>

All `rabbitmqctl` commands will report the node absence if no broker is running.

See the [CLI tools guide](/cli.html) to learn more.


## <a id="server-logs" class="anchor" href="#server-logs">Log Files and Management</a>

[Server logs](/logging.html) can be found under the [configurable](/relocate.html) directory, which usually
defaults to `/var/log/rabbitmq` when RabbitMQ is installed via a Linux package manager.

`RABBITMQ_LOG_BASE` can be used to override [log directory location](/relocate.html).

Assuming a `systemd`-based distribution, system service logs can be
inspected using

<pre class="lang-bash">
journalctl --system
</pre>

which requires superuser privileges.
Its output can be filtered to narrow it down to RabbitMQ-specific entries:

<pre class="lang-bash">
sudo journalctl --system | grep rabbitmq
</pre>

The output will look similar to this:

<pre class="lang-ini">
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.7.16. Copyright (c) 2007-2019 Pivotal Software, Inc.
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL.  See http://www.rabbitmq.com/
Dec 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Dec 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
</pre>

### Log Rotation

The broker always appends to the [log files](/logging.html), so a complete log history is retained.

[logrotate](https://linux.die.net/man/8/logrotate) is the recommended way of log file rotation and compression.
By default, the package will set up `logrotate` to run weekly on files located in default
`/var/log/rabbitmq` directory. Rotation configuration can be found in
`/etc/logrotate.d/rabbitmq-server`.
