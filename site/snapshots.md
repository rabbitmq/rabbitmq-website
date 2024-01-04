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

# Snapshots Releases

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ server builds that successfully went through our CI
pipeline are published. These builds are available so that users
can try out the latest features and bug fixes as soon as they
become available.


## <a id="stability-and-safety" class="anchor" href="#stability-and-safety">Stability and Suitability of Snapshot Builds</a>

Snapshot builds are produced from all supported release series branches and from
the 'main' branch which will become the next feature release.

In the case of the 'main' branch, this represents the
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


## <a id="documentation" class="anchor" href="#documentation">Documentation of the 'main' branch</a>

Documentation for default branch of the RabbitMQ distribution is continuously published to
[next.rabbitmq.com](http://next.rabbitmq.com/documentation.html).
Note that cutting edge branch documentation can lag behind code changes, sometimes
intentionally so.


## <a id="downloads" class="anchor" href="#downloads">Downloads and Installation</a>

As with our published live releases, we continue to digitally
sign the snapshot artefacts using [GnuPG](http://www.gnupg.org/) and
[our release public signing key](./signatures.html).

### <a id="direct-downloads" class="anchor" href="#direct-downloads">Direct Downloads</a>

All snapshot artefacts are available for download [from GitHub](https://github.com/rabbitmq/rabbitmq-server-binaries-dev/releases).


## <a id="feedback" class="anchor" href="#feedback">Providing Feedback on Snapshot Builds</a>

Team RabbitMQ appreciates community feedback on snapshot builds.
Please post it to the [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users)
and specify what build was used plus as much context as possible:

 * Server [log file(s)](./logging.html)
 * A code snippet or terminal (shell) transcript that demonstrates steps to reproduce the observations
 * `rabbitmqctl environment` output
 * `rabbitmq-diagnostics status` output
 * OS and distribution version
 * Erlang version used

and so on. Thank you!
