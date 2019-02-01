<?xml version="1.0"?>
<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License, 
Version 2.0 (the "License”); you may not use this file except in compliance 
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="max-open-files-intro">
  <p>
    RabbitMQ installations running production workloads may need system
    limits and kernel parameters tuning in order to handle a decent number of
    concurrent connections and queues. The main setting that needs adjustment
    is the max number of open files, also known as <code>ulimit -n</code>.
    The default value on many operating systems is too low for a messaging
    broker (eg. 1024 on several Linux distributions). We recommend allowing
    for at least 65536 file descriptors for user <code>rabbitmq</code> in
    production environments. 4096 should be sufficient for most development
    workloads.
  </p>
</doc:subsection>
