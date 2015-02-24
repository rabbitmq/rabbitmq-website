<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-options-other-linux">
  <p>
    The most straightforward way to adjust the per-user limit for
    RabbitMQ is to edit the <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a>
    to invoke <code>ulimit</code> before the service is started.

<pre class="sourcecode">
ulimit -S -n 4096
</pre>
  </p>

  <p>
    This <em>soft</em> limit cannot go higher than the <em>hard</em> limit
    (which defaults to 4096 in many distributions).
    <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">The hard limit can be increased</a> via
    <code>/etc/security/limits.conf</code>. This also requires enabling the <a href="http://askubuntu.com/a/34559">pam_limits.so</a> module
    and re-login or reboot.
  </p>

  <p>
    Note that limits cannot be changed for running OS processes.
  </p>
</doc:section>
