---
title: "Who are you? Authentication and authorisation in RabbitMQ 2.3.1"
tags: ["New Features", "HowTo", ]
authors: [simon]
---

RabbitMQ 2.3.1 introduces a couple of new plugin mechanisms, allowing you much more control over how users authenticate themselves against Rabbit, and how we determine what they are authorised to do. There are three questions of concern here:

1. How does the client prove its identity over the wire?
1. Where do users and authentication information (e.g. password hashes) live?
1. Where does permission information live?

Question 1 is answered in the case of AMQP by [SASL](http://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) - a simple protocol for pluggable authentication mechanisms that is embedded within AMQP (and various other protocols). SASL lets a client and a server negotiate and use an authentication mechanism, without the "outer" protocol having to know any of the details about how authentication works.

SASL offers a number of "mechanisms". Since the beginning, RabbitMQ has supported the PLAIN mechanism, which basically consists of sending a username and password over the wire in plaintext (of course possibly the whole connection might be protected by SSL). It's also supported the variant AMQPLAIN mechanism (which is conceptually identical to PLAIN but slightly easier to implement if you have an AMQP codec lying around). RabbitMQ 2.3.1 adds a plugin system allowing you to add or configure more mechanisms, and we've written an example plugin which implements the SASL EXTERNAL mechanism.

<!-- truncate -->

The SASL EXTERNAL mechanism basically says "somehow determine the user's identity by some mechanism outside the context of the protocol". In [rabbitmq-auth-mechanism-ssl](/docs/access-control#certificate-authentication) we take this to be SSL. When this plugin is installed and [enabled](/docs/authentication), clients can connect without supplying a username and password if they connect with SSL and present a client certificate which is trusted by the server's CA. In this case we take the username to be the Common Name of the certificate presented. As long as that username exists, they are let in.

But does that username exist? And what permissions are recorded against it? This is where we face up to questions number 2 (aka authentication) and 3 (aka authorisation).

Again, since the beginning, RabbitMQ has contained an internal database of users and permissions, managed though [rabbitmqctl](/docs/man/rabbitmqctl.8), and more recently the [management plugin](/docs/management). And again, RabbitMQ 2.3.1 adds a plugin system that allows you to augment or replace this database.

And again, we've written a plugin to do something interesting. [rabbitmq-auth-backend-ldap](/docs/ldap) lets you authenticate your users and check authorisation against an [LDAP](http://en.wikipedia.org/wiki/LDAP) database. This can entirely replace the built in database, or just augment it. [Configuring this plugin for authentication](http://hg.rabbitmq.com/rabbitmq-auth-backend-ldap/file/default/README) is (relatively) easy once you have an LDAP server up and running; you provide a template Distinguished Name for all your users (so that for example a user logging in as "guest" might have the DN "cn=guest,ou=People,dc=example,dc=com", and the plugin will attempt to bind to the LDAP server to check if they can log in. Easy!

Configuring the plugin for authorisation is hard though. Well, complicated. The problem is that LDAP has no ideas about how permissions should work in an AMQP broker (horrendous oversight!) and so we need to decide on some rules ourselves. The [README-authorisation](http://hg.rabbitmq.com/rabbitmq-auth-backend-ldap/file/default/README-authorisation) documents how this works in some detail, but in short there is a simple hierarchical query mechanism which lets you build queries against the LDAP database. For example:

```erlang
{vhost_access_query, {exists, "ou=${vhost},ou=vhosts,dc=example,dc=com"}}
```

is a simple query which determines whether LDAP users can see a virtual host based on whether a corresponding Organisational Unit exists in LDAP, while:

```erlang
{resource_access_query,
 {for, [{resource, exchange,
         {for, [{permission, configure,
                 { in_group, "cn=wheel,ou=groups,dc=example,dc=com" } },
                {permission, write, {constant, true}},
                {permission, read,  {constant, true}}
               ]}},
        {resource, queue, {constant, true}} ]}}
```

is a more complex query which would allow members of the "wheel" group to declare and delete exchanges, and allow all users to do everything else.

So, what do you think? Is this useful to you? How could it be improved?
