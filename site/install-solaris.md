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

# Installing on Solaris

The [Generic binary build](./install-generic-unix.html) installation instructions may be used to install
RabbitMQ on Solaris, with two modifications.


The RabbitMQ shell scripts assume a standard POSIX environment.
On Solaris this requires that startup scripts be executed with
the `/usr/xpg4/bin/sh` shell. This can
be accomplished by replacing the first line of each script
(which normally reads `#!/bin/sh`) with `#!/usr/xpg4/bin/sh`.

The RabbitMQ shell scripts assume the existence of the
"readlink" utility for resolving symbolic links. This can be
obtained by installing the
[Sunfreeware](http://www.sunfreeware.com/)
"coreutils" package or compiling
[GNU coreutils](http://www.gnu.org/software/coreutils/).
