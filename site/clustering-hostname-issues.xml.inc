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
<doc:section name="issues-hostname" xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
  <doc:heading>Hostname Changes</doc:heading>
  <p>
    RabbitMQ nodes use hostnames to communicate with each other. Therefore,
    all node names must be able to resolve names of all cluster peers. This is
    also true for tools such as <code>rabbitmqctl</code>.
  </p>
  <p>
    In addition to that, by default RabbitMQ names the database directory using the
    current hostname of the system. If the hostname
    changes, a new empty database is created. To avoid data loss it's
    crucial to set up a fixed and resolvable hostname.

    Whenever the hostname changes RabbitMQ node must be restarted.
  </p>
  <p>
    A similar effect can be achieved by using <code>rabbit@localhost</code>
    as the broker nodename.
    The impact of this solution is that clustering will not work, because
    the chosen hostname will not resolve to a routable address from remote
    hosts. The <code>rabbitmqctl</code> command will similarly fail when
    invoked from a remote host. A more sophisticated solution that does not
    suffer from this weakness is to use DNS, e.g. 
    <a href="https://aws.amazon.com/route53/">Amazon Route 53</a> if running
    on EC2. If you want to use the full hostname for your nodename (RabbitMQ
    defaults to the short name), and that full hostname is resolveable using DNS,
    you may want to investigate setting the environment variable
    <code>RABBITMQ_USE_LONGNAME=true</code>.
  </p>
  <p>
    See the section on <a href="/clustering.html#overview-hostname-requirements">hostname resolution</a> for more information.
  </p>
</doc:section>
