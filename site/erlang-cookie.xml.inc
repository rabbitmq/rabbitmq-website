<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="erlang-cookie">
  <doc:heading>How Nodes (and CLI tools) Authenticate to Each Other: the Erlang Cookie</doc:heading>
  <p>
    RabbitMQ nodes and CLI tools (e.g. <code>rabbitmqctl</code>) use a
    cookie to determine whether they are allowed to communicate with
    each other. For two nodes to be able to communicate they must have
    the same shared secret called the Erlang cookie. The cookie is
    just a string of alphanumeric characters up to 255 characters in size.
    It is usually stored in a local file. The file must be only
    accessible to the owner (e.g. have UNIX permissions of <code>600</code> or similar).
    Every cluster node must have the same cookie.
  </p>
  <p>
    If the file does not exist, Erlang VM will automatically create
    one with a randomly generated value when the RabbitMQ server
    starts up. Erlang cookie management is best done using automation
    tools such as Chef, BOSH, Docker or similar.
  </p>
  <p>
    On UNIX systems, the cookie will be typically
    located in <code>/var/lib/rabbitmq/.erlang.cookie</code> (used by the server)
    and <code>$HOME/.erlang.cookie</code> (used by CLI tools).
  </p>
  <p>
    On Windows, the locations are <code>C:\Users\<i>Current User</i>\.erlang.cookie</code> (<code>%HOMEDRIVE% + %HOMEPATH%\.erlang.cookie</code>)
    or <code>C:\Documents and Settings\<i>Current User</i>\.erlang.cookie</code>, and
    <code>C:\Windows\.erlang.cookie</code> for RabbitMQ Windows service.
    If Windows service is used, the cookie should be placed in both places.
  </p>
  <p>
    As an alternative, you can add the option "<code>-setcookie <i>value</i></code>" in the <code>RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS</code> <a href="/configure.html">environment variable value</a>:


<pre class="sourcecode ini">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

    This is the least secure option and generally not recommended.
  </p>
  <p>
     When the cookie is misconfigured (for example, not identical), RabbitMQ will log errors
     such as "Connection attempt from disallowed node" and "Could not auto-cluster". When
     a <a href="/cli.html">CLI tool</a> such as <code>rabbitmqctl</code> fails to authenticate with RabbitMQ,
     the message usually says

<pre class="sourcecode ini">
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
</pre>

An incorrectly placed cookie file or cookie value mismatch are most common scenarios for such failures.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

<pre class="sourcecode ini">
* connected to epmd (port 4369) on warp10
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed

* Authentication failed (rejected by the remote node), please check the Erlang cookie
</pre>

    See the <a href="/cli.html">CLI Tools guide</a> for more information.
  </p>
</doc:subsection>
