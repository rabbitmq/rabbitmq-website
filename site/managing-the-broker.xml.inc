<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the server or check its status, etc., you can invoke
    <code>sbin/rabbitmqctl</code> (as the user running
    <code>rabbitmq-server</code>). All <code>rabbitmqctl</code>
    commands will report the node absence if no broker is running.
  </p>
  <ul>
    <li>Invoke <code>rabbitmqctl stop</code> to stop the server.</li>
    <li>Invoke <code>rabbitmqctl status</code> to check whether it is
      running.</li>
  </ul>
  <p>
    More <a href="man/rabbitmqctl.1.man.html">info on rabbitmqctl</a>.
  </p>
</doc:section>
