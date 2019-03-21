<?xml version="1.0"?>
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

<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-different-limits">
    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>fs.file-max</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
</doc:subsection>
