<?xml version="1.0"?>
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
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="prerequisites">
  <doc:heading>Required Libraries and Tools</doc:heading>

  <p>
    In order to build RabbitMQ, you will need a few tools.
  </p>

  <p>
    RabbitMQ requires a recent version of <a
    href="http://www.python.org/download/">Python</a> and <a
    href="http://pypi.python.org/pypi/simplejson">simplejson.py</a>
    (an implementation of a <a href="http://json.org">JSON</a> reader
    and writer in Python), for generating AMQP framing code.
    simplejson.py is included as a standard json library in the Python
    core since 2.6 release.
  </p>

  <p>
    Additionally, you will need
  </p>

  <ul class="compact">
    <li>
      the <a href="http://www.erlang.org/download.html">Erlang</a>
      development and runtime tools<br/> If you are on a Debian-based
      system then you need the <i>erlang-nox</i> and <i>erlang-dev</i>
      packages installed.  If you are building and installing Erlang
      from source then you must ensure that openssl is installed on
      your system.
    </li>

    <li>
      a recent version of <a
      href="http://www.gnu.org/software/make/">GNU make</a>
    </li>

    <li>
      a recent version of <i>xsltproc</i>, which is part of <a
      href="http://xmlsoft.org/XSLT/">libxslt</a>
    </li>
  </ul>
</doc:section>
