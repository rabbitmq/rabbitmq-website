---
title: "MQTT Adapter"
tags: ["New Features", ]
authors: [emile]
---

I've written a plugin for RabbitMQ that adds support for the [MQTT 3.1](https://www.ibm.com/developerworks/webservices/library/ws-mqtt/) protocol. MQ Telemetry Transport is a light-weight PUB/SUB protocol designed for resource-constrained devices and limited bandwidth situations, making it ideally suited to sensors and mobile devices. The implementation is a protocol adapter plugin, allowing MQTT clients to connect to a RabbitMQ broker simultaneously with clients implementing other protocols. We encourage projects that demand the combination of a low-overhead protocol on a robust, scalable broker with high reliability and enterprise features to consider this option.

<!-- truncate -->

## Supported features

### QoS 0 and QoS 1

The MQTT adapter supports QoS 0 (at most once) and QoS 1 (at least once) semantics. In MQTT QoS relates to transport assurance as well as persistence - the plugin honours both. While clients are permitted to request QoS 2 subscriptions, the adapter will only grant subscriptions up to QoS 1.

### Last Will and Testament (LWT)

Clients can provide a LWT message during connection that will only be published if the client disconnects unexpectedly, e.g. due to a network failure.

### Sticky sessions

Clients can make use of sticky (or non-clean) sessions to ensure they receive messages that were published whilst they were disconnected.

### Default logins

Default authentication details can be optionally be configured so that the MQTT adapter authenticates to the RabbitMQ broker as a default user in case a connecting MQTT client provides no login details.

## Extended features

While not explicitly enumerated, all core broker features are available to MQTT clients.

MQTT subscription wildcards are limited in that they may only appear as a suffix. AMQP topics are not limited in this way, so wildcards can appear in any position. The MQTT adapter implements the more flexible AMQP patterns, but with MQTT syntax.

The MQTT specification does not mention SSL or any interaction between SSL and authentication. The MQTT adapter includes SSL capability now, with the possibility of integrating certificates with authentication on the future.

The MQTT concept of "bridging" can be realised with RabbitMQ's [federation](/docs/federation) by federating the exchanges that the MQTT adapter publishes to.

## Future features

AMQP 0-9-1 does not define "exactly once" semantics for message delivery. For this reason the MQTT adapter does not support publishing messages at the QoS 2 (exactly once) level, or exchanging PUBREC, PUBREL or PUBCOMP messages with clients.

"Retained messages" is an MQTT feature where the broker retains flagged messages and delivers them to future subscribing clients. E.g. in a topic for sensor readings, a retained message allows a client to receive the last reading without needing to wait for the next reading. By default AMQP 0-9-1 exchanges do not retain any message state. Therefore the MQTT adapter makes no attempt to honour the "Retained" flag, which will be silently ignored.

These are areas where we are especially interested in obtaining feedback from the community. There is scope to enhance the core broker with these features not only for MQTT clients, but potentially for (extended) AMQP and other clients as well - provided there is sufficient demand.

## Interoperability with other MQTT implementations

The MQTT adapter has been successfully tested with the MQTT clients of the following products, when restricting operation to the supported features:

* Really Small Message Broker
* Mosquitto
* Paho
* WebSphere MQ

## Interoperability with other protocols

The MQTT adapter uses one configurable exchange for publishing, and subscriptions are implemented as AMQP bindings. In combination these allow interoperability with any clients that know the name of the exchange or the topics used by MQTT clients.

## Installation

First make sure you have [rabbitmq-server 2.8.6](/docs/download) installed. (The plugin should also be compatible with other v2.8.x releases.)

The MQTT adapter is currently available as a preview release. You must download and install the plugin manually until it is included as a regular plugin in a future release. The plugin can be downloaded from the [preview release downloads](https://www.rabbitmq.com/releases/plugins/v2.8.6-mqtt-preview/rabbitmq_mqtt-2.8.6.ez), e.g.

```shell
wget https://www.rabbitmq.com/releases/plugins/v2.8.6-mqtt-preview/rabbitmq_mqtt-2.8.6.ez
```

The *.ez file must be copied to the [plugins directory](/docs/plugins#plugin-directories). On my Debian-based workstation this is in ` /usr/lib/rabbitmq/lib/rabbitmq_server-2.8.6/plugins`:

```shell
sudo cp rabbitmq_mqtt-2.8.6.ez /usr/lib/rabbitmq/lib/rabbitmq_server-2.8.6/plugins
```

Enable the plugin using [rabbitmq-plugins](/docs/plugins):

```shell
sudo rabbitmq-plugins enable rabbitmq_mqtt
```

Restart the rabbitmq server

```shell
sudo /etc/init.d/rabbitmq-server restart 
```

The broker logfile should now include a new line indicating that it is ready to accept MQTT connections:

```
=INFO REPORT==== 12-Sep-2012::14:21:26 ===
  started MQTT TCP Listener on [::]:1883
```

The default configuration options should work fine in most cases. A description of all configuration options is included in the [readme](http://hg.rabbitmq.com/rabbitmq-mqtt/file/default/README.md). You will need to provide further configuration if you wish to set up SSL, or define a different exchange in order to facilitate [federation](/docs/federation).

You can now try to execute the [included tests](http://hg.rabbitmq.com/rabbitmq-mqtt/file/default/test/src/com/rabbitmq/mqtt/test/MqttTest.java) (based on the Java Paho client library), or your own MQTT application.

See the [contact](/contact) page for details on how to provide feedback.
