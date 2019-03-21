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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="default-user-access">
  <doc:heading>Default user access</doc:heading>
  <p>
    The broker creates a user <code>guest</code> with password
    <code>guest</code>. Unconfigured clients will in general use these
    credentials. <strong>By default, these credentials can only be
    used when connecting to the broker as localhost</strong> so you
    will need to take action before connecting from any other
    machine.
  </p>
  <p>
    See the documentation on <a href="access-control.html">access
    control</a> for information on how to create more users, delete
    the <code>guest</code> user, or allow remote access to the
    <code>guest</code> user.
  </p>
</doc:section>
