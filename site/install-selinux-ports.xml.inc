<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="selinux-ports">
  <doc:heading>Security and Ports</doc:heading>
  <p>
    SELinux and similar mechanisms may prevent RabbitMQ from binding to a port. When that happens,
    RabbitMQ will fail to start. Make sure the following ports can be opened:

    <ul>
      <li>4369 (epmd), 25672 (Erlang distribution) </li>
      <li>5672, 5671 (AMQP 0-9-1 without and with TLS)</li>
      <li>15672 (if management plugin is enabled)</li>
      <li>61613, 61614 (if STOMP is enabled)</li>
      <li>1883, 8883 (if MQTT is enabled)</li>
    </ul>
  </p>
</doc:section>
