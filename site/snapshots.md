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

# Snapshots Releases

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ server builds that successfully went through our CI
pipeline are published. These builds are available so that users
can try out the latest features and bug fixes as soon as they
become available.


## <a id="stability-and-safety" class="anchor" href="#stability-and-safety">Stability and Suitability of Snapshot Builds</a>

Snapshot builds are produced from all supported release series branches and from
the 'master' branch which will become the next feature release.

In the case of the 'master' branch, this represents the
<i>bleeding edge</i> and therefore should not be considered
complete (finished) or stable. It is quite possible that
existing features, APIs and/or configuration data formats have
been changed in ways that are not backwards compatible or even
removed altogether.

In addition to the changes described above, it is also possible that
incompatible changes have been made to the way persistent storage
is handled. Such changes may mean that after installing a snapshot,
your RabbitMQ installation <i>cannot be rolled back to a previous (stable) version</i>. To avoid conflicting with the existing
installation, you should either remove it first, or configure the
snapshot installation to use an alternative location for its
persistent storage and (potentially) other configuration elements
using the [provided instructions](relocate.html).

Snapshot releases therefore are suitable for development and some QA
environments but not intended to be used in production.


## <a id="documentation" class="anchor" href="#documentation">Documentation of the 'master' branch</a>

Documentation for master branch of the broker is continuously published to
[next.rabbitmq.com](http://next.rabbitmq.com/documentation.html).
Note that master documentation can lag behind code changes, sometimes
intentionally so.


## <a id="downloads" class="anchor" href="#downloads">Downloads and Installation</a>

As with our published live releases, we continue to digitally
sign the snapshot artefacts using [GnuPG](http://www.gnupg.org/) and
[our release public signing key](/signatures.html).

### <a id="direct-downloads" class="anchor" href="#direct-downloads">Direct Downloads</a>

All snapshot artefacts, indexed by their version, are available
in the <em>all-dev</em> repository on Bintray:

 * [Bintray webpage](https://bintray.com/rabbitmq/all-dev/rabbitmq-server)
 * [Bintray repository](https://dl.bintray.com/rabbitmq/all-dev/rabbitmq-server/)

### <a id="apt" class="anchor" href="#apt">Debian (apt) Repository</a>

Packages for many Debian-based Linux distributions are available
from a Bintray repository called <em>debian-dev</em>.

Use Debian components to select exactly what will be installed:

<dl>
<dt><code>main</code></dt>
<dd>Gives access to all snapshots we produce, not only the RabbitMQ server.</dd>
<dt><code>rabbitmq</code></dt>
<dd>Gives access to all snapshots of the RabbitMQ server, no matter the branch.</dd>
<dt><code>rabbitmq-v3.8.x</code></dt>
<dd>Gives access to snapshots of the 3.8.x line of the RabbitMQ server.</dd>
<dt><code>rabbitmq-v3.7.x</code></dt>
<dd>Gives access to snapshots of the 3.7.x line of the RabbitMQ server.</dd>
</dl>

 * [Bintray webpage](https://bintray.com/rabbitmq/debian-dev/rabbitmq-server)
 * [Bintray repository](https://dl.bintray.com/rabbitmq/debian-dev/)

For instance, if you want to use RabbitMQ 3.8.x snapshots on a Debian Stretch:

<pre class="lang-bash">
wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | apt-key add -
cat >/etc/apt/sources.list.d/rabbitmq-dev.list &lt;&lt;EOF
deb http://dl.bintray.com/rabbitmq/debian-dev stretch rabbitmq-server-v3.8.x
EOF
apt-get update
apt-get install rabbitmq-server</pre>

### <a id="yum" class="anchor" href="#yum">RPM (Yum) Repository</a>

Packages for RPM-based Linux distributions are available from a
Bintray repository called <em>rpm-dev</em> which serves several
Yum repositories. There is a Yum repository per package we
produce (the RabbitMQ server being one) and per version of
supported distributions.

 * [Bintray webpage](https://bintray.com/rabbitmq/rpm-dev/rabbitmq-server)
 * [Bintray repository](https://dl.bintray.com/rabbitmq/rpm-dev/rabbitmq-server/)

For instance, if you want to use RabbitMQ 3.8.x snapshots on a CentOS 7:

<pre class="lang-bash">
cat >/etc/yum.repos.d/rabbitmq-dev.repo &lt;&lt;EOF
[rabbitmq-dev]
name=rabbitmq-dev
baseurl=https://dl.bintray.com/rabbitmq/rpm-dev/rabbitmq-server/v3.8.x/el/7
gpgcheck=1
gpgkey=https://www.rabbitmq.com/rabbitmq-release-signing-key.asc
repo_gpgcheck=0
enabled=1
EOF
yum install rabbitmq-server
</pre>


## <a id="feedback" class="anchor" href="#feedback">Providing Feedback on Snapshot Builds</a>

Team RabbitMQ appreciates community feedback on snapshot builds.
Please post it to the [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users)
and specify what build was used plus as much context as possible:

 * Server [log file(s)](/logging.html)
 * A code snippet or terminal (shell) transcript that demonstrates steps to reproduce the observations
 * `rabbitmqctl environment` output
 * `rabbitmqctl status` output
 * OS and distribution version
 * Erlang version used

and so on. Thank you!
