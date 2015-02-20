<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit">
    <doc:heading>Controlling System Limits on Linux</doc:heading>
    <xi:include href="max-open-files-limit-intro.xml.inc" />

    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>fs.file-max</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
    <p>
      For more information about controlling <code>fs-file-max</code> with <code>sysctl</code>,
      please refer to the excellent <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Riak guide on open file limit tuning</a>.
    </p>
    <p>
      To adjust the per-user limit for RabbitMQ, there are several options:

      <ul>
        <li><a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Configure max open files limit</a> via <code>/etc/security/limits.conf</code>.</li>
        <li>
          Edit the <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a> to
          invoke <code>ulimit</code> before the service is started.
        </li>
      </ul>
    </p>

    <xi:include href="max-open-files-limit-per-session.xml.inc" />
    <xi:include href="max-open-files-limit-tools.xml.inc" />
</doc:section>
