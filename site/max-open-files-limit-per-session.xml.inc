<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="invoke-ulimit">
  <doc:heading>Adjusting the Limit for Current Session Only</doc:heading>
  <p>
    The following command

<pre class="sourcecode">
ulimit -n 16384
</pre>
    will set the maximum number of file open handles for the
    service process to 16384. The change will be effective for the current
    session, which is sufficient when invoked from <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a>.
  </p>
</doc:subsection>
