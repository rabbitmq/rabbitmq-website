<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-options-other-linux">
  <p>
    To adjust the per-user limit for RabbitMQ, there are several options:

    <ul>
      <li>
        Edit the <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a> to
        invoke <code>ulimit</code> before the service is started. This is the most straightforward way.
      </li>
      <li>
        <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Configure max open files limit</a> via
        <code>/etc/security/limits.conf</code>. Requires enabling the <a href="http://askubuntu.com/a/34559">pam_limits.so</a> module
        and re-login.
      </li>
    </ul>
  </p>
</doc:section>
