<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="osx-max-open-files-limit">
    <doc:heading>Controlling System Limits on OS X</doc:heading>
    <xi:include href="max-open-files-limit-intro.xml.inc" />

    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>kern.maxfilesperproc</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
    <p>
      For more information about controlling
      <code>kern.maxfilesperproc</code> with <code>sysctl</code>,
      please refer to <a href="https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man8/sysctl.8.html">sysctl(8)</a>
      page in Apple documentation.
    </p>
    <p>
      To adjust the per-user limit for RabbitMQ, there are several options:

      <ul>
        <li>
          Invoke <code>ulimit -S -n 4096</code> before starting RabbitMQ in foreground.
        </li>
        <li>
          Edit the <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a> to
          invoke <code>ulimit</code> before the service is started.
        </li>
        <li>
          <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Mac-OS-X">Configure max open files limit</a> via <code>launchctl limit</code>
        <code>/etc/launchd.conf</code>.
        </li>
      </ul>
    </p>

    <xi:include href="max-open-files-limit-verifying-osx.xml.inc" />
    <xi:include href="max-open-files-limit-tools.xml.inc" />
</doc:section>
