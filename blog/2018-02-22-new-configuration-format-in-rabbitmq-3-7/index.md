---
title: "New Configuration Format in RabbitMQ 3.7"
tags: ["New Features", ]
authors: [mklishin]
---

In this post we'll cover a new configuration format available
in RabbitMQ 3.7.0.

<!-- truncate -->

## Why Do We Need a New Format

Many developers and operators have strong opinions about software configuration formats. Debates about the pros and cons of a particular format center on readability, whether a format
supports comments, and so on.

Those are valid concerns indeed but configuration files are not always hand crafted by a human. In the age of rising automation expectations, the ease of generation of a particular format is rarely discussed.

Historically, RabbitMQ uses Erlang term files for configuration. Besides being the standard way of configuring Erlang-based systems, it strikes a good balance of power and safety: any Erlang data structure can be used,
including arbitrary nesting, yet arbitrary code cannot be evaluated.

That format, however, also has a few downsides that became obvious once the project had accumulated a certain critical mass of users:

* It's not familiar to those getting started with RabbitMQ
* It has subtle aspects such as required trailing dots and commas that confuse beginners
* Arbitrary nesting can be powerful and sometimes necessary but it also can greatly complicate config file generation
* In some cases familiarity with different Erlang data types was necessary (e.g. lists vs. binaries) for no good reason

Team RabbitMQ wanted to address all of those concerns but particularly the last one. Provisioning tools such as Chef and BOSH manage to generate functional config files but that code is difficult to read and maintain,
which in turn means that it is error-prone.

## The New Format

After evaluating all the usual suspects, we settled on an <code>ini</code>-like format used by <code>sysctl</code> and Riak. It [uses a different config extension](/docs/configure#config-file-formats), `.conf`, and looks like this:

```ini
heartbeat = 30
```

This overrides default [heartbeat](/docs/heartbeats) value
offered by the server to 30 seconds.

Most settings use a single line, with configuration key and value separated by an
equality sign and zero or more spaces. Such formats have been around for
decades and are known to be fairly readable for humans.

Here's a slightly longer example:

```ini
heartbeat = 30

listeners.tcp.default = 5672
```

In addition to the hearbeat setting, it also configures a TCP listener
to use port 5672 and bind to all interfaces available.

Settings can be structured (logically grouped) using dots. For example,
all plain TCP (as opposed to TCP plus TLS) listener settings are grouped
under `listener.tcp.*`.

Here's how TLS certificates and key are configured in the new format:

```ini
ssl_options.cacertfile           = /path/to/testca/cacert.pem
ssl_options.certfile             = /path/to/server/cert.pem
ssl_options.keyfile              = /path/to/server/key.pem
ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = true
```

Compare this to the same settings in the classic (Erlang terms) format:

```erlang
[
  {rabbit, [{ssl_options, [{cacertfile,           "/path/to/testca/cacert.pem"},
                           {certfile,             "/path/to/server/cert.pem"},
                           {keyfile,              "/path/to/server/key.pem"},
                           {verify,               verify_peer},
                           {fail_if_no_peer_cert, true}]}]}
].
```

Besides being easier to read, the new version is much easier to generate.

It also has one less obvious improvement: the values are now
validated with a schema. For path values such as the private key path this means
that should a file not be found or not be readable, the node will
immediately report it and refuse to start. Previously the node would
start but the files would fail to load at runtime, which is a great
way to confuse deployment and monitoring tools.

Fields that expect numerical values will refuse to accept strings, and so on.
The new format offers some of the benefits of static typing, which is not
the case with many commonly used formats.

## Collections

Single value keys are trivial to configure in this format. But what about
collections? For example, it's possible to configure more than
one TCP listener. It is also possible to [list cluster nodes](/blog/2018/02/18/peer-discovery-subsystem-in-rabbitmq-3-7) for
peer discovery purposes. How does this format account for that?

The new format supports collections that are maps (dictionaries). For values
that are arrays or sets, the keys are ignored. Here's how to specify a list of nodes
for peer discovery:

```ini
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

cluster_formation.classic_config.nodes.1 = rabbit1@hostname
cluster_formation.classic_config.nodes.2 = rabbit2@hostname
cluster_formation.classic_config.nodes.3 = rabbit3@hostname
cluster_formation.classic_config.nodes.4 = rabbit4@hostname
```

The keys in this example are `1`, `2` and so on. Any key values can be used. Sequentially
growing numbers are easy to generate, so that's what our documentation examples use.

## Comments

Comments are supported in the new format, allowing us to continue providing
an [annotated example file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.conf.example):

```ini
## Select an authentication/authorisation backend to use.
##
## Alternative backends are provided by plugins, such as rabbitmq-auth-backend-ldap.
##
## NB: These settings require certain plugins to be enabled.
##
## Related doc guides:
##
##  * http://www.rabbitmq.com/plugins.html
##  * http://www.rabbitmq.com/access-control.html
##

auth_backends.1   = rabbit_auth_backend_internal

## uses separate backends for authentication and authorisation,
## see below.
# auth_backends.1.authn = rabbit_auth_backend_ldap
# auth_backends.1.authz = rabbit_auth_backend_internal
```

## Advanced Configuration

As nice as this format is, there are certain limitations to it. Consider the following
config file that demonstrates a number of features in the [LDAP plugin](/docs/ldap):

```erlang
[
  {rabbit, [{auth_backends, [rabbit_auth_backend_ldap]}]},
  {rabbitmq_auth_backend_ldap,
   [ {servers,               ["my-ldap-server"]},
     {user_dn_pattern,       "cn=${username},ou=People,dc=example,dc=com"},
     {use_ssl,               false},
     {port,                  389},
     {log,                   false},
     {vhost_access_query,    {in_group,
                              "ou=${vhost}-users,ou=vhosts,dc=example,dc=com"}},
     {resource_access_query,
      {for, [{permission, configure, {in_group, "cn=admin,dc=example,dc=com"}},
             {permission, write,
              {for, [{resource, queue,    {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, exchange, {constant, true}}]}},
             {permission, read,
              {for, [{resource, exchange, {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, queue,    {constant, true}}]}}
            ]
      }},
     {topic_access_query,
      {for, [{permission, write, {match, {string, "${routing_key}"}, {string, "^a"}}},
             {permission, read,  {constant, true}}
            ]
     }},
     {tag_queries,           [{administrator, {constant, false}},
                              {management,    {constant, true}}]}
   ]
  }
].
```

This example uses deeply nested data structures to express LDAP queries. Such scenarios do not
fit the new format very well but they have to be supported.

To account for this, it is now possible to specify another config file, `advanced.config`, in the
[classic (Erlang terms) config format](/docs/configure#config-file-formats).

The two config formats are then merged. How is this possible? The trick is in translating
the new format to the old one, which we will cover next.

Alternatively it is possible to only use the legacy config format. It makes sense
during a transition period, for example.

## How it Works

As mentioned above, the new format is translated into the classic one
under the hood since that's what a lot of libraries, including in Erlang/OTP, expect.
The translation is done by a tool called [Cuttlefish](https://github.com/Kyorai/cuttlefish),
originally developed by Basho Technologies. On start, RabbitMQ nodes use Cuttlefish
to do the following:

 * Collect config schema files from all plugins
 * Run Cuttlefish to do the translation
 * Combines the result with the `advanced.config` file
 * Loads the final config

For both RabbitMQ core and plugins the process is entirely transparent. All the
heavy lifting is done by a number of functions that form a [translation schema](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/priv/schema/rabbit.schema).
Cuttlefish does the parsing and invokes schema functions to perform validation
and translation.

## Plugin Configuration

Plugins that have configurable settings now ship their own schemas that are extracted
and incorporated into the main one on node boot.

Here's what management plugin configuration might look like:

```ini
management.listener.port = 15672
management.listener.ip   = 127.0.0.1
management.listener.ssl  = true

management.listener.ssl_opts.cacertfile = /path/to/cacert.pem
management.listener.ssl_opts.certfile   = /path/to/cert.pem
management.listener.ssl_opts.keyfile = /path/to/key.pem
```

The [schema file](https://github.com/rabbitmq/rabbitmq-management/blob/v3.7.x/priv/schema/rabbitmq_management.schema) for `management.*` keys is provided by the management plugin.

## Conclusion

This new format makes RabbitMQ config files be more familiar and readable
to humans, easier to generate for tools, and introduces value validation against an extensible schema.
Plugins can ship their own config schema files and benefit from the new format.

It still possible to use the previous format or combine the two. We believe that
the new format can cover the proverbial 80% of use cases, though.

Take a look at the updated [configuration guide](/docs/configure),
give this feature a try and let us know what you think on the [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users)!
