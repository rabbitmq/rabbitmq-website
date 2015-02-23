<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-options-debian">
  <p>
    The most straightforward way to adjust the per-user limit for
    RabbitMQ is to edit the <code>/etc/default/rabbitmq-server</code>
    (provided by the RabbitMQ Debian package) or <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a>
    to invoke <code>ulimit</code> before the service is started.

<pre class="sourcecode">
ulimit -S -n 4096
</pre>

    Note that limits cannot be changed for running OS processes.
  </p>

  <p>
    To adjust the limit to values higher than <code>4096</code> (the default "hard" limit), it is necessary to
    <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">increase the "hard" limit</a> via
    <code>/etc/security/limits.conf</code>. This also requires enabling the <a href="http://askubuntu.com/a/34559">pam_limits.so</a> module
    and re-login or reboot.
  </p>
</doc:subsection>
