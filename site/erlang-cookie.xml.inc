<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
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
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="erlang-cookie">
  <doc:heading>How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie</doc:heading>
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
    If the file does not exist, Erlang VM will try to create
    one with a randomly generated value when the RabbitMQ server
    starts up. Using such generated cookie files are appropriate in development
    environments only. Since each node will generate its own value independently,
    this strategy is not really viable in a <a href="/clustering.html">clustered environment</a>.
    
    Erlang cookie generation should be done at cluster deployment stage, ideally using automation
    and orchestration tools such as Chef, Puppet, BOSH, Docker or similar.
  </p>
  <p>
    On UNIX systems, the cookie will be typically located in
    <code>/var/lib/rabbitmq/.erlang.cookie</code> (used by the server)
    and <code>$HOME/.erlang.cookie</code> (used by CLI tools). Note
    that since the value of `$HOME` varies from user to user, it's
    necessary to place a copy of the cookie file for each user that
    will be using the CLI tools. This applies to both non-privileged
    users and `root`.
  </p>

  <p>
    On Windows, the cookie file location varies depending on Erlang version used and whether the <code>HOMEDRIVE</code> or <code>HOMEPATH</code>
    environment variables are set.
  </p>

  <p>
    With Erlang versions starting with 20.2, the cookie file locations are:
    <ul>
      <li>
        <code>%HOMEDRIVE%%HOMEPATH%\.erlang.cookie</code> (usually <code>C:\Users\%USERNAME%\.erlang.cookie</code> for user <code>%USERNAME%</code>) if both the <code>HOMEDRIVE</code> and <code>HOMEPATH</code> environment variables are set
      </li>
      <li>
        <code>%USERPROFILE%\.erlang.cookie</code> (usually <code>C:\Users\%USERNAME%\.erlang.cookie</code>) if <code>HOMEDRIVE</code> and <code>HOMEPATH</code> are not both set
      </li>
      <li>
        For the RabbitMQ Windows service - <code>%USERPROFILE%\.erlang.cookie</code> (usually <code>C:\WINDOWS\system32\config\systemprofile</code>)
      </li>
    </ul>
    The cookie file used by the Windows service account and the user
    running CLI tools must be synchronised.
  </p>

  <p>
    On <a href="/which-erlang.html">Erlang versions</a> prior to 20.2 (e.g. 19.3 or 20.1), the cookie file locations are:
    <ul>
      <li>
        <code>%HOMEDRIVE%%HOMEPATH%\.erlang.cookie</code> (usually <code>C:\Users\%USERNAME%\.erlang.cookie</code> for user <code>%USERNAME%</code>) if both the <code>HOMEDRIVE</code> and <code>HOMEPATH</code> environment variables are set
      </li>
      <li>
        <code>%USERPROFILE%\.erlang.cookie</code> (usually <code>C:\Users\%USERNAME%\.erlang.cookie</code>) if <code>HOMEDRIVE</code> and <code>HOMEPATH</code> are not both set
      </li>
      <li>
        For the RabbitMQ Windows service - <code>%WINDIR%\.erlang.cookie</code> (usually <code>C:\Windows\.erlang.cookie</code>)
      </li>
    </ul>
    The cookie file used by the Windows service account and the user
    running CLI tools must be synchronised.
  </p>

  <p>
    As an alternative, you can add the option "<code>-setcookie <i>value</i></code>" in the <code>RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS</code> <a href="/configure.html">environment variable value</a>:

<pre class="lang-ini">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

    This is the least secure option and generally not recommended.
  </p>

  <p>
     When the cookie is misconfigured (for example, not identical), RabbitMQ will log errors
     such as "Connection attempt from disallowed node" and "Could not auto-cluster". When
     a <a href="/cli.html">CLI tool</a> such as <code>rabbitmqctl</code> fails to authenticate with RabbitMQ,
     the message usually says

<pre class="lang-ini">
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
</pre>

An incorrectly placed cookie file or cookie value mismatch are most common scenarios for such failures.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

<pre class="lang-ini">
* connected to epmd (port 4369) on warp10
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed

* Authentication failed (rejected by the remote node), please check the Erlang cookie
</pre>

    See the <a href="/cli.html">CLI Tools guide</a> for more information.
  </p>
</doc:subsection>
