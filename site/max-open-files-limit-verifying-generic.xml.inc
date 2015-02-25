<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="verifying-limits">
  <doc:heading>Verifying the Limit</doc:heading>
  <p>
    <a href="management.html">RabbitMQ management UI</a> displays the number of file descriptors available
    for it to use on the Overview tab.
<pre class="sourcecode">rabbitmqctl status</pre>
    includes the same value.
  </p>
  <p>
    The following command

<pre  class="sourcecode">
ulimit -a
</pre>

    can be used to display effective limits for the current user. There may be more convenient
    OS-specific ways of doing that for a running process, such as the <code>/proc</code> filesystem on Linux.
  </p>
</doc:subsection>
