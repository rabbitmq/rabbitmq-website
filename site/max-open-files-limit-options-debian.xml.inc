<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-options-debian">
  <p>
    To adjust the per-user limit for RabbitMQ, there are several options:

    <ul>
      <li>
        Edit the <code>/etc/default/rabbitmq-server</code> (provided by the RabbitMQ Debian package)
        or <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a> to
        invoke <code>ulimit</code> before the service is started. This is the most straightforward way.
      </li>
      <li>
        <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Configure max open files limit</a> via
        <code>/etc/security/limits.conf</code>. Requires a reboot or enabling the <a href="http://askubuntu.com/a/34559">pam_limits.so</a> module
        for all sessions. There are <a href="http://lzone.de/Debian%20Ubuntu%20ulimit%20Check%20List">several caveats</a> when using
        this approach.
      </li>
    </ul>
  </p>
</doc:subsection>
