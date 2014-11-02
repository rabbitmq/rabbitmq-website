<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="default-user-access">
  <doc:heading>Default user access</doc:heading>
  <p>
    The broker creates a user <code>guest</code> with password
    <code>guest</code>. Unconfigured clients will in general use these
    credentials. <strong>By default, these credentials can only be
    used when connecting to the broker as localhost</strong> so you
    will need to take action before connecting fromn any other
    machine.
  </p>
  <p>
    See the documentation on <a href="access-control.html">access
    control</a> for information on how to create more users, delete
    the <code>guest</code> user, or allow remote access to the
    <code>guest</code> user.
  </p>
</doc:section>
