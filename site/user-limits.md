<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Per-user Resource Limits

## Overview

Similarly to [per-virtual host resource limits](./vhosts.html#limits), it is possible to limit
how many connections and channels a specific user can open.

These limits can be used as guard rails in environments where applications
cannot be trusted and monitored in detail, for example, when RabbitMQ clusters
are offered as a service.

The limits can be configured using [`rabbitmqctl set_user_limits`](./cli.html) or the [HTTP API](./management.html#http-api).

## <a id="connections" class="anchor" href="#connections">Maximum Number of Connections</a>

To limit how many connection a user can open, set the `max-connections` limit to
a positive integer:

<pre class="lang-bash">
rabbitmqctl set_user_limits user1 '{"max-connections": 10}'
</pre>

To set the limit over the HTTP API, use the following endpoint:

<pre class="lang-ini">
PUT /api/user-limits/{username}/{limit}
</pre>

and a request body like this:

<pre class="lang-javascript">
{"value": 20}
</pre>

Here is an example that uses `curl`:

<pre class="lang-bash">
# using the HTTP API
curl -v -u guest:guest -X PUT http://localhost:15672/api/user-limits/user1/max-connections \
                       -H "content-type: application/json" \
                       -d @- &lt;&lt;EOF
{
  "value": 20
}
EOF
</pre>

## <a id="channels" class="anchor" href="#channels">Maximum Number of Channels</a>

To limit how many channels, in total, a user can open, set the `max-channels` limit to
a positive integer:

<pre class="lang-bash">
# using CLI tools
rabbitmqctl set_user_limits guest '{"max-connections": 10, "max-channels": 20}'
</pre>

To set the limit over the HTTP API, use the following endpoint:

<pre class="lang-ini">
PUT /api/user-limits/{username}/{limit}
</pre>

and a request body like this:

<pre class="lang-javascript">
{"value": 20}
</pre>

Here is an example that uses `curl` to set a limit for user `user1`:

<pre class="lang-bash">
# using the HTTP API
curl -v -u guest:guest -X PUT http://localhost:15672/api/user-limits/user1/max-channels \
                       -H "content-type: application/json" \
                       -d @- &lt;&lt;EOF
{
  "value": 20
}
EOF
</pre>

The limit is applied to the total number of channels across all connections opened
by the user. Therefore, it must be equal or greater than that the aforementioned maximum
connection limit.

## <a id="clearing" class="anchor" href="#clearing">Clearing User Limits</a>

To clear all limits for a user, use [`rabbitmqctl clear_user_limits`](./cli.html) or the [HTTP API](./management.html#http-api).

Here are some examples that clear all limits for user `user1`:

<pre class="lang-bash">
# clears the maximum number of connections limit
rabbitmqctl clear_user_limits user1 'max-connections'

# clears the maximum number of channels limit
rabbitmqctl clear_user_limits user1 'max-channels'

# clears all limits in a single operation
rabbitmqctl clear_user_limits user1 all
</pre>

To clear the limit over the HTTP API, use the following endpoint:

<pre class="lang-ini">
DELETE /api/user-limits/{username}/{limit}
</pre>

without a request body.

Here is an example that uses `curl` to clear all limits of user `user1`:

<pre class="lang-bash">
# using the HTTP API
curl -v -u guest:guest -X DELETE http://localhost:15672/api/user-limits/user1/max-channels

curl -v -u guest:guest -X DELETE http://localhost:15672/api/user-limits/user1/max-connections
</pre>