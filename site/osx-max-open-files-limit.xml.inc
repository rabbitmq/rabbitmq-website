<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="osx-max-open-files-limit">
    <doc:heading>Controlling System Limits on OS X</doc:heading>
    <p>
      RabbitMQ installations running may need system
      limits and kernel parameters tuning in order to handle a decent number of
      concurrent connections and queues. The main setting that needs adjustment
      is the max number of open files, also known as <code>ulimit -n</code>.
      The default value on OS X is in low thousands, which may be too low
      for a messaging broker. We recommend allowing for at least <code>8192</code> file descriptors
      for RabbitMQ.
    </p>
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
        <li><a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Configuring max open files limit</a> via <code>launchctl limit</code>
        <code>/etc/launchd.conf</code>.</li>
        <li>
          Edit the file <code>/etc/default/rabbitmq-server</code> to
          invoke <code>ulimit</code> before the service is started.
        </li>
      </ul>
    </p>
    <p>
      The following command

<pre class="sourcecode">
  ulimit -n 16384
</pre>
      will set the maximum number of file open handles for the
      service process to 16384. The change will be effective for the current
      session, which is sufficient when invoked from <code>/etc/default/rabbitmq-server</code>.
    </p>

    <p>
      Configuration management tools (e.g. Chef, Puppet, BOSH) provide assistance
      with system limit tuning. Our <a href="devtools.html#devops-tools">developer tools</a> guide
      lists relevant modules and projects.
    </p>
</doc:section>
