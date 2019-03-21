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
<doc:section name="erlang"
  xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
  <doc:heading>Erlang Versions Across the Cluster</doc:heading>
  <p>
  All nodes in a cluster must run the same minor <a href="/which-erlang.html">version of Erlang</a>: <code>19.3.4</code>
  and <code>19.3.6</code> can be mixed but <code>19.0.1</code> and <code>19.3.6</code> (or <code>17.5</code> and <code>19.3.6</code>) cannot.
  Compatibility between individual Erlang/OTP patch versions
  can vary between releases but that's generally rare.
  </p>
</doc:section>
