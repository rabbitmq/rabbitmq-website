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

# Windows Quirks

We aim to make RabbitMQ a first-class citizen on
Windows. However, sometimes there are circumstances beyond our
control that can introduce quirky behaviour. This page documents
them.

## Cannot install to a path with non-ASCII characters

RabbitMQ will fail to start with the error that reads

<pre class="lang-text">
RabbitMQ: Erlang machine stopped instantly (distribution name conflict?)
</pre>

when installed to a path with non-ASCII characters in it.
This is because we need to pass the location of the compiled Erlang files to the Erlang VM.
It expects input in UTF-8, but the console will typically use some other encoding.

### Workarounds

<ul>
  <li>
    Override <code>RABBITMQ_BASE</code> to point to a directory
    that only has ASCII characters and <em>re-install</em> the
    service.
  </li>
  <li>
    Edit the file <code>rabbitmq-server.bat</code> and change the
    line "<code>set TDP0=%~dp0</code>" to "
    <code>set TDP0=%~dps0</code>". This will use short paths (the
    infamous <code>C:\PROGRA~1</code>) everywhere.
  </li>
</ul>

## rabbitmqctl displays or parses non-ASCII characters incorrectly

Similarly, [RabbitMQ CLI tools](/cli.html) will expect command line
parameters to be encoded in UTF-8, and display strings as
UTF-8. The console will instead provide and expect some
country-specific encoding.

### Workarounds

<ul>
  <li>
    On recent versions of Windows, issue the command "
    <code>chcp 65001</code>" before using <code>rabbitmqctl</code> to force
    the console to use UTF-8. (Beware: on older versions
    including Windows XP this will cause the console to silently
    fail to run any batch file at all!) <em>or</em>
  </li>
  <li>
    Avoid using non-ASCII characters in object names <em>or</em>
  </li>
  <li>
    Use the <a href="management.html">management plugin</a> instead of
    <code>rabbitmqctl</code>.
  </li>
</ul>

## Installing as a non-administrator user leaves <a href="/clustering.html#erlang-cookie">.erlang.cookie</a>
in the wrong place


This makes it impossible to use [CLI tools](/cli.html) and cluster nodes.

### Workarounds

<ul>
  <li>
    Run the installer as an administrator <em>or</em>
  </li>
  <li>
    Copy the file <code>.erlang.cookie</code> manually
    from <code>%SystemRoot%</code> or
    <code>%SystemRoot%\system32\config\systemprofile</code>
    to <code>%HOMEDRIVE%%HOMEPATH%</code>.
  </li>
</ul>
