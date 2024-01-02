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

# Standalone MacOS Build

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ releases used to include a special binary package for macOS that bundled
a supported version of Erlang/OTP. As of September 2019, this package has been discontinued.
It will no longer be produced for new RabbitMQ releases.

macOS users should use the [Homebrew formula](./install-homebrew.html)
or the [generic binary build](./install-generic-unix.html) (requires a [supported version of Erlang](./which-erlang.html)
to be installed separately) to provision RabbitMQ.
