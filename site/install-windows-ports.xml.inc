<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="windows-ports">
  <doc:heading>Security and Ports</doc:heading>
  <p>
    Firewalls and other security tools may prevent RabbitMQ from binding to a port. When that happens,
    RabbitMQ will fail to start. Make sure the following ports can be opened:

    <xi:include href="list-of-ports.xml.inc" />
  </p>
</doc:section>
