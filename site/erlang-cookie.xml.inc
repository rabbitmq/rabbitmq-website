<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<!--
Copyright (C) 2007-2015 Pivotal Software, Inc. 

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
  <doc:heading>Erlang cookie</doc:heading>
  <p>
    Erlang nodes use a cookie to determine whether they are allowed to
    communicate with each other - for two nodes to be able to
    communicate they must have the same cookie.  The cookie is just a
    string of alphanumeric characters. It can be as long or short as
    you like. Every cluster node must have
    the same cookie. The cookie is also used for tools such as <code>rabbitmqctl</code>
    and <code>rabbitmq-plugins</code>.
  </p>
  <p>
    Erlang will automatically create a random cookie file when
    the RabbitMQ server starts up. The easiest way to proceed is to allow
    one node to create the file, and then copy it to all the
    other nodes in the cluster.
  </p>
  <p>
    On Unix systems, the cookie will be typically
    located in <code>/var/lib/rabbitmq/.erlang.cookie</code>
    or <code>$HOME/.erlang.cookie</code>.
  </p>
  <p>
    On Windows, the locations are <code>C:\Users\<i>Current User</i>\.erlang.cookie</code> (<code>%HOMEDRIVE% + %HOMEPATH%\.erlang.cookie</code>)
    or <code>C:\Documents and Settings\<i>Current User</i>\.erlang.cookie</code>, and
    <code>C:\Windows\.erlang.cookie</code> for RabbitMQ Windows service.
    If Windows service is used, the cookie should be placed in both places.
  </p>
  <p>
    As an alternative, you can insert the option "<code>-setcookie
    <i>cookie</i></code>" in the <code>erl</code> call in the
    <code>rabbitmq-server</code> and <code>rabbitmqctl</code>
    scripts.
  </p>
  <p>
     When the cookie is misconfigured (for example, not identical), RabbitMQ will log errors
     such as "Connection attempt from disallowed node" and "Could not auto-cluster".
  </p>
</doc:subsection>
