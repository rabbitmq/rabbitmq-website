---
title: AMQP 0-9-1 Complete Reference Guide
---
import ValidAnchors from '@site/src/components/ValidAnchors';

<ValidAnchors>
left-content
content-pane
class.connection
connection.start
connection.start.version-major
connection.start.version-minor
connection.start.server-properties
connection.start.mechanisms
connection.start.locales
connection.start-ok
connection.start-ok.client-properties
connection.start-ok.mechanism
connection.start-ok.response
connection.start-ok.locale
connection.secure
connection.secure.challenge
connection.secure-ok
connection.secure-ok.response
connection.tune
connection.tune.channel-max
connection.tune.frame-max
connection.tune.heartbeat
connection.tune-ok
connection.tune-ok.channel-max
connection.tune-ok.frame-max
connection.tune-ok.heartbeat
connection.open
connection.open.virtual-host
connection.open.reserved-1
connection.open.reserved-2
connection.open-ok
connection.open-ok.reserved-1
connection.close
connection.close.reply-code
connection.close.reply-text
connection.close.class-id
connection.close.method-id
connection.close-ok
connection.blocked
connection.blocked.reason
connection.unblocked
connection.update-secret
connection.update-secret.new-secret
connection.update-secret.reason
connection.update-secret-ok
class.channel
channel.open
channel.open.reserved-1
channel.open-ok
channel.open-ok.reserved-1
channel.flow
channel.flow.active
channel.flow-ok
channel.flow-ok.active
channel.close
channel.close.reply-code
channel.close.reply-text
channel.close.class-id
channel.close.method-id
channel.close-ok
class.exchange
exchange.declare
exchange.declare.reserved-1
exchange.declare.exchange
exchange.declare.type
exchange.declare.passive
exchange.declare.durable
exchange.declare.auto-delete
exchange.declare.internal
exchange.declare.no-wait
exchange.declare.arguments
exchange.declare-ok
exchange.delete
exchange.delete.reserved-1
exchange.delete.exchange
exchange.delete.if-unused
exchange.delete.no-wait
exchange.delete-ok
exchange.bind
exchange.bind.reserved-1
exchange.bind.destination
exchange.bind.source
exchange.bind.routing-key
exchange.bind.no-wait
exchange.bind.arguments
exchange.bind-ok
exchange.unbind
exchange.unbind.reserved-1
exchange.unbind.destination
exchange.unbind.source
exchange.unbind.routing-key
exchange.unbind.no-wait
exchange.unbind.arguments
exchange.unbind-ok
class.queue
queue.declare
queue.declare.reserved-1
queue.declare.queue
queue.declare.passive
queue.declare.durable
queue.declare.exclusive
queue.declare.auto-delete
queue.declare.no-wait
queue.declare.arguments
queue.declare-ok
queue.declare-ok.queue
queue.declare-ok.message-count
queue.declare-ok.consumer-count
queue.bind
queue.bind.reserved-1
queue.bind.queue
queue.bind.exchange
queue.bind.routing-key
queue.bind.no-wait
queue.bind.arguments
queue.bind-ok
queue.unbind
queue.unbind.reserved-1
queue.unbind.queue
queue.unbind.exchange
queue.unbind.routing-key
queue.unbind.arguments
queue.unbind-ok
queue.purge
queue.purge.reserved-1
queue.purge.queue
queue.purge.no-wait
queue.purge-ok
queue.purge-ok.message-count
queue.delete
queue.delete.reserved-1
queue.delete.queue
queue.delete.if-unused
queue.delete.if-empty
queue.delete.no-wait
queue.delete-ok
queue.delete-ok.message-count
class.basic
basic.qos
basic.qos.prefetch-size
basic.qos.prefetch-count
basic.qos.global
basic.qos-ok
basic.consume
basic.consume.reserved-1
basic.consume.queue
basic.consume.consumer-tag
basic.consume.no-local
basic.consume.no-ack
basic.consume.exclusive
basic.consume.no-wait
basic.consume.arguments
basic.consume-ok
basic.consume-ok.consumer-tag
basic.cancel
basic.cancel.consumer-tag
basic.cancel.no-wait
basic.cancel-ok
basic.cancel-ok.consumer-tag
basic.publish
basic.publish.reserved-1
basic.publish.exchange
basic.publish.routing-key
basic.publish.mandatory
basic.publish.immediate
basic.return
basic.return.reply-code
basic.return.reply-text
basic.return.exchange
basic.return.routing-key
basic.deliver
basic.deliver.consumer-tag
basic.deliver.delivery-tag
basic.deliver.redelivered
basic.deliver.exchange
basic.deliver.routing-key
basic.get
basic.get.reserved-1
basic.get.queue
basic.get.no-ack
basic.get-ok
basic.get-ok.delivery-tag
basic.get-ok.redelivered
basic.get-ok.exchange
basic.get-ok.routing-key
basic.get-ok.message-count
basic.get-empty
basic.get-empty.reserved-1
basic.ack
basic.ack.delivery-tag
basic.ack.multiple
basic.reject
basic.reject.delivery-tag
basic.reject.requeue
basic.recover-async
basic.recover-async.requeue
basic.recover
basic.recover.requeue
basic.recover-ok
basic.nack
basic.nack.delivery-tag
basic.nack.multiple
basic.nack.requeue
class.tx
tx.select
tx.select-ok
tx.commit
tx.commit-ok
tx.rollback
tx.rollback-ok
class.confirm
confirm.select
confirm.select.nowait
confirm.select-ok
domains-table
domain.bit
domain.class-id
domain.consumer-tag
domain.delivery-tag
domain.exchange-name
domain.long
domain.longlong
domain.longstr
domain.message-count
domain.method-id
domain.no-ack
domain.no-local
domain.no-wait
domain.octet
domain.path
domain.peer-properties
domain.queue-name
domain.redelivered
domain.reply-code
domain.reply-text
domain.short
domain.shortstr
domain.table
domain.timestamp
constants-table
constant.frame-method
constant.frame-header
constant.frame-body
constant.frame-heartbeat
constant.frame-min-size
constant.frame-end
constant.reply-success
constant.content-too-large
constant.no-route
constant.no-consumers
constant.connection-forced
constant.invalid-path
constant.access-refused
constant.not-found
constant.resource-locked
constant.precondition-failed
constant.frame-error
constant.syntax-error
constant.command-invalid
constant.channel-error
constant.unexpected-frame
constant.resource-error
constant.not-allowed
constant.not-implemented
constant.internal-error
help-and-feedback
contribute
</ValidAnchors>

<div id="left-content">
    <div id="content-pane">
        <p>
            This page contains a complete reference to RabbitMQ's implementaton of version 0-9-1 of the AMQP specification. The
            [original specification](/resources/specs/amqp0-9-1.xml) was published by the [AMQP WG](http://www.amqp.org) in 2008 and is made available under the
            [AMQP license](http://www.amqp.org/legal/amqp-license).
        </p>
        <p>
            Elsewhere on this site you can read details of [RabbitMQ's conformance to the specification](/docs/specification). RabbitMQ implements [several extensions](/docs/extensions) to the core specification that are
            documented in this guide. The original and extended specification downloads can be found on the [protocol page](/amqp-0-9-1-protocol).
        </p>
        <p>You may also be interested in our [Protocol and API Quick Reference](./amqp-0-9-1-quickref).</p>
        <div>

### Protocol Information {#protocol-info}

            <a class="back" href="#">(back to top)</a>
        </div>
        <dl>
            <dt>Major-minor version:</dt>
            <dd>0-9</dd>
            <dt>Revision:</dt>
            <dd>1</dd>
            <dt>Port:</dt>
            <dd>5672</dd>
            <dt>Description:</dt>
            <dd>AMQ Protocol version 0-9-1</dd>
        </dl>
        <div>

### Classes {#classes}

            <a class="back" href="#">(back to top)</a>
        </div>
        <p>The following classes, with their associated methods, are defined in the specification:</p>
        <div id="class.connection" class="class">
            <h3 class="inline-block">connection</h3>
            <p>Work with socket connections.</p>
            <p>
                The connection class provides methods for a client to establish a network connection to a server, and for both peers to operate the connection thereafter.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      connection          = open-connection *use-connection close-connection
      open-connection     = C:protocol-header
                            S:START C:START-OK
                            *challenge
                            S:TUNE C:TUNE-OK
                            C:OPEN S:OPEN-OK
      challenge           = S:SECURE C:SECURE-OK
      use-connection      = *channel
      close-connection    = C:CLOSE S:CLOSE-OK
                          / S:CLOSE C:CLOSE-OK

            </pre>
            <p></p>
            <h4>Methods</h4>
            <h5 id="connection.start" class="method-sig">
                <div class="method-name" title="start - id:10">start(</div>
                <div class="method-params">
                    <a href="#connection.start.version-major">
                        <span class="parameter"><span class="data-type" title="octet">octet</span>&nbsp;<span class="param-name" title="protocol major version">version-major</span></span>
                    </a>
                    ,
                    <a href="#connection.start.version-minor">
                        <span class="parameter"><span class="data-type" title="octet">octet</span>&nbsp;<span class="param-name" title="protocol minor version">version-minor</span></span>
                    </a>
                    ,
                    <a href="#connection.start.server-properties">
                        <span class="parameter"><span class="data-type" title="table">peer-properties</span>&nbsp;<span class="param-name" title="server properties">server-properties</span></span>
                    </a>
                    ,
                    <a href="#connection.start.mechanisms">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="available security mechanisms">mechanisms</span></span>
                    </a>
                    ,
                    <a href="#connection.start.locales">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="available message locales">locales</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.start-ok">start-ok</a></span>
                </div>
            </h5>
            <p>Start connection negotiation.</p>
            <p>
                This method starts the connection negotiation process by telling the client the protocol version that the server proposes, along with a list of security mechanisms which the client can use for authentication.
            </p>
            <ul class="rules">
                <li>
                    If the server cannot support the protocol specified in the protocol header, it MUST respond with a valid protocol header and then close the socket connection.
                </li>
                <li>
                    The server MUST provide a protocol version that is lower than or equal to that requested by the client in the protocol header.
                </li>
                <li>
                    If the client cannot handle the protocol version suggested by the server it MUST close the socket connection without sending any further data.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="connection.start.version-major" class="field"><a href="#domain.octet" title="octet">octet</a> <span title="protocol major version" class="field-name">version-major</span></p>
            <p class="param-desc">
                The major version number can take any value from 0 to 99 as defined in the AMQP specification.
            </p>
            <p id="connection.start.version-minor" class="field"><a href="#domain.octet" title="octet">octet</a> <span title="protocol minor version" class="field-name">version-minor</span></p>
            <p class="param-desc">
                The minor version number can take any value from 0 to 99 as defined in the AMQP specification.
            </p>
            <p id="connection.start.server-properties" class="field"><a href="#domain.peer-properties" title="table">peer-properties</a> <span title="server properties" class="field-name">server-properties</span></p>
            <p class="param-desc">Server properties.</p>
            <ul class="rules">
                <li>
                    The properties SHOULD contain at least these fields: "host", specifying the server host name or address, "product", giving the name of the server product, "version", giving the name of the server version, "platform",
                    giving the name of the operating system, "copyright", if appropriate, and "information", giving other general information.
                </li>
            </ul>
            <p id="connection.start.mechanisms" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="available security mechanisms" class="field-name">mechanisms</span></p>
            <p class="param-desc">
                A list of the security mechanisms that the server supports, delimited by spaces.
            </p>
            <p id="connection.start.locales" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="available message locales" class="field-name">locales</span></p>
            <p class="param-desc">
                A list of the message locales that the server supports, delimited by spaces. The locale defines the language in which the server will send reply texts.
            </p>
            <ul class="rules">
                <li>
                    The server MUST support at least the en_US locale.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.start-ok" class="method-sig">
                <div class="method-name" title="start-ok - id:11">start-ok(</div>
                <div class="method-params">
                    <a href="#connection.start-ok.client-properties">
                        <span class="parameter"><span class="data-type" title="table">peer-properties</span>&nbsp;<span class="param-name" title="client properties">client-properties</span></span>
                    </a>
                    ,
                    <a href="#connection.start-ok.mechanism">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="selected security mechanism">mechanism</span></span>
                    </a>
                    ,
                    <a href="#connection.start-ok.response">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="security response data">response</span></span>
                    </a>
                    ,
                    <a href="#connection.start-ok.locale">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="selected message locale">locale</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Select security mechanism and locale.</p>
            <p>
                This method selects a SASL security mechanism.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.start-ok.client-properties" class="field"><a href="#domain.peer-properties" title="table">peer-properties</a> <span title="client properties" class="field-name">client-properties</span></p>
            <p class="param-desc">Client properties.</p>
            <ul class="rules">
                <li>
                    The properties SHOULD contain at least these fields: "product", giving the name of the client product, "version", giving the name of the client version, "platform", giving the name of the operating system, "copyright",
                    if appropriate, and "information", giving other general information.
                </li>
            </ul>
            <p id="connection.start-ok.mechanism" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="selected security mechanism" class="field-name">mechanism</span></p>
            <p class="param-desc">
                A single security mechanisms selected by the client, which must be one of those specified by the server.
            </p>
            <ul class="rules">
                <li>
                    The client SHOULD authenticate using the highest-level security profile it can handle from the list provided by the server.
                </li>
                <li>
                    If the mechanism field does not contain one of the security mechanisms proposed by the server in the Start method, the server MUST close the connection without sending any further data.
                </li>
            </ul>
            <p id="connection.start-ok.response" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="security response data" class="field-name">response</span></p>
            <p class="param-desc">
                A block of opaque data passed to the security mechanism. The contents of this data are defined by the SASL security mechanism.
            </p>
            <p id="connection.start-ok.locale" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="selected message locale" class="field-name">locale</span></p>
            <p class="param-desc">
                A single message locale selected by the client, which must be one of those specified by the server.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.secure" class="method-sig">
                <div class="method-name" title="secure - id:20">secure(</div>
                <div class="method-params">
                    <a href="#connection.secure.challenge">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="security challenge data">challenge</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.secure-ok">secure-ok</a></span>
                </div>
            </h5>
            <p>Security mechanism challenge.</p>
            <p>
                The SASL protocol works by exchanging challenges and responses until both peers have received sufficient information to authenticate each other. This method challenges the client to provide more information.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.secure.challenge" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="security challenge data" class="field-name">challenge</span></p>
            <p class="param-desc">
                Challenge information, a block of opaque binary data passed to the security mechanism.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.secure-ok" class="method-sig">
                <div class="method-name" title="secure-ok - id:21">secure-ok(</div>
                <div class="method-params">
                    <a href="#connection.secure-ok.response">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="security response data">response</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Security mechanism response.</p>
            <p>
                This method attempts to authenticate, passing a block of SASL data for the security mechanism at the server side.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.secure-ok.response" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="security response data" class="field-name">response</span></p>
            <p class="param-desc">
                A block of opaque data passed to the security mechanism. The contents of this data are defined by the SASL security mechanism.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.tune" class="method-sig">
                <div class="method-name" title="tune - id:30">tune(</div>
                <div class="method-params">
                    <a href="#connection.tune.channel-max">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="proposed maximum channels">channel-max</span></span>
                    </a>
                    ,
                    <a href="#connection.tune.frame-max">
                        <span class="parameter"><span class="data-type" title="long">long</span>&nbsp;<span class="param-name" title="proposed maximum frame size">frame-max</span></span>
                    </a>
                    ,
                    <a href="#connection.tune.heartbeat">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="desired heartbeat delay">heartbeat</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.tune-ok">tune-ok</a></span>
                </div>
            </h5>
            <p>Propose connection tuning parameters.</p>
            <p>
                This method proposes a set of connection configuration values to the client. The client can accept and/or adjust these.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.tune.channel-max" class="field"><a href="#domain.short" title="short">short</a> <span title="proposed maximum channels" class="field-name">channel-max</span></p>
            <p class="param-desc">
                Specifies highest channel number that the server permits. Usable channel numbers are in the range 1..channel-max. Zero indicates no specified limit.
            </p>
            <p id="connection.tune.frame-max" class="field"><a href="#domain.long" title="long">long</a> <span title="proposed maximum frame size" class="field-name">frame-max</span></p>
            <p class="param-desc">
                The largest frame size that the server proposes for the connection, including frame header and end-byte. The client can negotiate a lower value. Zero means that the server does not impose any specific limit but may reject
                very large frames if it cannot allocate resources for them.
            </p>
            <ul class="rules">
                <li>
                    Until the frame-max has been negotiated, both peers MUST accept frames of up to frame-min-size octets large, and the minimum negotiated value for frame-max is also frame-min-size.
                </li>
            </ul>
            <p id="connection.tune.heartbeat" class="field"><a href="#domain.short" title="short">short</a> <span title="desired heartbeat delay" class="field-name">heartbeat</span></p>
            <p class="param-desc">
                The delay, in seconds, of the connection heartbeat that the server wants. Zero means the server does not want a heartbeat.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.tune-ok" class="method-sig">
                <div class="method-name" title="tune-ok - id:31">tune-ok(</div>
                <div class="method-params">
                    <a href="#connection.tune-ok.channel-max">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="negotiated maximum channels">channel-max</span></span>
                    </a>
                    ,
                    <a href="#connection.tune-ok.frame-max">
                        <span class="parameter"><span class="data-type" title="long">long</span>&nbsp;<span class="param-name" title="negotiated maximum frame size">frame-max</span></span>
                    </a>
                    ,
                    <a href="#connection.tune-ok.heartbeat">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="desired heartbeat delay">heartbeat</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Negotiate connection tuning parameters.</p>
            <p>
                This method sends the client's connection tuning parameters to the server. Certain fields are negotiated, others provide capability information.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.tune-ok.channel-max" class="field"><a href="#domain.short" title="short">short</a> <span title="negotiated maximum channels" class="field-name">channel-max</span></p>
            <p class="param-desc">
                The maximum total number of channels that the client will use per connection.
            </p>
            <ul class="rules">
                <li>
                    If the client specifies a channel max that is higher than the value provided by the server, the server MUST close the connection without attempting a negotiated close. The server may report the error in some fashion to
                    assist implementors.
                </li>
            </ul>
            <p id="connection.tune-ok.frame-max" class="field"><a href="#domain.long" title="long">long</a> <span title="negotiated maximum frame size" class="field-name">frame-max</span></p>
            <p class="param-desc">
                The largest frame size that the client and server will use for the connection. Zero means that the client does not impose any specific limit but may reject very large frames if it cannot allocate resources for them. Note
                that the frame-max limit applies principally to content frames, where large contents can be broken into frames of arbitrary size.
            </p>
            <ul class="rules">
                <li>
                    Until the frame-max has been negotiated, both peers MUST accept frames of up to frame-min-size octets large, and the minimum negotiated value for frame-max is also frame-min-size.
                </li>
                <li>
                    If the client specifies a frame max that is higher than the value provided by the server, the server MUST close the connection without attempting a negotiated close. The server may report the error in some fashion to
                    assist implementors.
                </li>
            </ul>
            <p id="connection.tune-ok.heartbeat" class="field"><a href="#domain.short" title="short">short</a> <span title="desired heartbeat delay" class="field-name">heartbeat</span></p>
            <p class="param-desc">
                The delay, in seconds, of the connection heartbeat that the client wants. Zero means the client does not want a heartbeat.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.open" class="method-sig">
                <div class="method-name" title="open - id:40">open(</div>
                <div class="method-params">
                    <a href="#connection.open.virtual-host">
                        <span class="parameter"><span class="data-type" title="shortstr">path</span>&nbsp;<span class="param-name" title="virtual host name">virtual-host</span></span>
                    </a>
                    ,
                    <a href="#connection.open.reserved-1">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#connection.open.reserved-2">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="">reserved-2</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.open-ok">open-ok</a></span>
                </div>
            </h5>
            <p>Open connection to virtual host.</p>
            <p>
                This method opens a connection to a virtual host, which is a collection of resources, and acts to separate multiple application domains within a server. The server may apply arbitrary limits per virtual host, such as the
                number of each type of entity that may be used, per connection and/or in total.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.open.virtual-host" class="field"><a href="#domain.path" title="shortstr">path</a> <span title="virtual host name" class="field-name">virtual-host</span></p>
            <p class="param-desc">
                The name of the virtual host to work with.
            </p>
            <ul class="rules">
                <li>
                    If the server supports multiple virtual hosts, it MUST enforce a full separation of exchanges, queues, and all associated entities per virtual host. An application, connected to a specific virtual host, MUST NOT be able
                    to access resources of another virtual host.
                </li>
                <li>
                    The server SHOULD verify that the client has permission to access the specified virtual host.
                </li>
            </ul>
            <p id="connection.open.reserved-1" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="connection.open.reserved-2" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="" class="field-name">reserved-2</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.open-ok" class="method-sig">
                <div class="method-name" title="open-ok - id:41">open-ok(</div>
                <div class="method-params">
                    <a href="#connection.open-ok.reserved-1">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Signal that connection is ready.</p>
            <p>
                This method signals to the client that the connection is ready for use.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.open-ok.reserved-1" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="" class="field-name">reserved-1</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.close" class="method-sig">
                <div class="method-name" title="close - id:50">close(</div>
                <div class="method-params">
                    <a href="#connection.close.reply-code">
                        <span class="parameter"><span class="data-type" title="short">reply-code</span>&nbsp;<span class="param-name" title="">reply-code</span></span>
                    </a>
                    ,
                    <a href="#connection.close.reply-text">
                        <span class="parameter"><span class="data-type" title="shortstr">reply-text</span>&nbsp;<span class="param-name" title="">reply-text</span></span>
                    </a>
                    ,
                    <a href="#connection.close.class-id">
                        <span class="parameter"><span class="data-type" title="short">class-id</span>&nbsp;<span class="param-name" title="failing method class">class-id</span></span>
                    </a>
                    ,
                    <a href="#connection.close.method-id">
                        <span class="parameter"><span class="data-type" title="short">method-id</span>&nbsp;<span class="param-name" title="failing method ID">method-id</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.close-ok">close-ok</a></span>
                </div>
            </h5>
            <p>Request a connection close.</p>
            <p>
                This method indicates that the sender wants to close the connection. This may be due to internal conditions (e.g. a forced shut-down) or due to an error handling a specific method, i.e. an exception. When a close is due to
                an exception, the sender provides the class and method id of the method which caused the exception.
            </p>
            <ul class="rules">
                <li>
                    After sending this method, any received methods except Close and Close-OK MUST be discarded. The response to receiving a Close after sending Close must be to send Close-Ok.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="connection.close.reply-code" class="field"><a href="#domain.reply-code" title="short">reply-code</a> <span title="" class="field-name">reply-code</span></p>
            <p id="connection.close.reply-text" class="field"><a href="#domain.reply-text" title="shortstr">reply-text</a> <span title="" class="field-name">reply-text</span></p>
            <p id="connection.close.class-id" class="field"><a href="#domain.class-id" title="short">class-id</a> <span title="failing method class" class="field-name">class-id</span></p>
            <p class="param-desc">
                When the close is provoked by a method exception, this is the class of the method.
            </p>
            <p id="connection.close.method-id" class="field"><a href="#domain.method-id" title="short">method-id</a> <span title="failing method ID" class="field-name">method-id</span></p>
            <p class="param-desc">
                When the close is provoked by a method exception, this is the ID of the method.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.close-ok" class="method-sig">
                <div class="method-name" title="close-ok - id:51">close-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm a connection close.</p>
            <p>
                This method confirms a Connection.Close method and tells the recipient that it is safe to release resources for the connection and close the socket.
            </p>
            <ul class="rules">
                <li>
                    A peer that detects a socket closure without having received a Close-Ok handshake method SHOULD log the error.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.blocked" class="method-sig">
                <div class="method-name" title="blocked - id:60">blocked(</div>
                <div class="method-params">
                    <a href="#connection.blocked.reason">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="Block reason">reason</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Indicate that connection is blocked.</p>
            <p>
                This method indicates that a connection has been blocked and does not accept new publishes.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.blocked.reason" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="Block reason" class="field-name">reason</span></p>
            <p class="param-desc">
                The reason the connection was blocked.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.unblocked" class="method-sig">
                <div class="method-name" title="unblocked - id:61">unblocked(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Indicate that connection is unblocked.</p>
            <p>
                This method indicates that a connection has been unblocked and now accepts publishes.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.update-secret" class="method-sig">
                <div class="method-name" title="update-secret - id:70">update-secret(</div>
                <div class="method-params">
                    <a href="#connection.update-secret.new-secret">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="new secret">new-secret</span></span>
                    </a>
                    ,
                    <a href="#connection.update-secret.reason">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="reason">reason</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#connection.update-secret-ok">update-secret-ok</a></span>
                </div>
            </h5>
            <p>Update secret.</p>
            <p>
                This method updates the secret used to authenticate this connection. It is used when secrets have an expiration date and need to be renewed, like OAuth 2 tokens.
            </p>
            <h5>Parameters:</h5>
            <p id="connection.update-secret.new-secret" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="new secret" class="field-name">new-secret</span></p>
            <p class="param-desc">
                The new secret.
            </p>
            <p id="connection.update-secret.reason" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="reason" class="field-name">reason</span></p>
            <p class="param-desc">
                The reason for the secret update.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="connection.update-secret-ok" class="method-sig">
                <div class="method-name" title="update-secret-ok - id:71">update-secret-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Update secret response.</p>
            <p>
                This method confirms the updated secret is valid.
            </p>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.channel" class="class">
            <h3 class="inline-block">channel</h3>
            <p>Work with channels.</p>
            <p>
                The channel class provides methods for a client to establish a channel to a server and for both peers to operate the channel thereafter.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      channel             = open-channel *use-channel close-channel
      open-channel        = C:OPEN S:OPEN-OK
      use-channel         = C:FLOW S:FLOW-OK
                          / S:FLOW C:FLOW-OK
                          / functional-class
      close-channel       = C:CLOSE S:CLOSE-OK
                          / S:CLOSE C:CLOSE-OK

            </pre>
            <p></p>
            <h4>Methods</h4>
            <h5 id="channel.open" class="method-sig">
                <div class="method-name" title="open - id:10">open(</div>
                <div class="method-params">
                    <a href="#channel.open.reserved-1">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#channel.open-ok">open-ok</a></span>
                </div>
            </h5>
            <p>Open a channel for use.</p>
            <p>
                This method opens a channel to the server.
            </p>
            <ul class="rules">
                <li>
                    The client MUST NOT use this method on an already-opened channel.

                    <span>Error code: </span><a href="#constant.channel-error">channel-error</a>
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="channel.open.reserved-1" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="" class="field-name">reserved-1</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="channel.open-ok" class="method-sig">
                <div class="method-name" title="open-ok - id:11">open-ok(</div>
                <div class="method-params">
                    <a href="#channel.open-ok.reserved-1">
                        <span class="parameter"><span class="data-type" title="longstr">longstr</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Signal that the channel is ready.</p>
            <p>
                This method signals to the client that the channel is ready for use.
            </p>
            <h5>Parameters:</h5>
            <p id="channel.open-ok.reserved-1" class="field"><a href="#domain.longstr" title="longstr">longstr</a> <span title="" class="field-name">reserved-1</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="channel.flow" class="method-sig">
                <div class="method-name" title="flow - id:20">flow(</div>
                <div class="method-params">
                    <a href="#channel.flow.active">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="start/stop content frames">active</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#channel.flow-ok">flow-ok</a></span>
                </div>
            </h5>
            <p>Enable/disable flow from peer.</p>
            <p>
                This method asks the peer to pause or restart the flow of content data sent by a consumer. This is a simple flow-control mechanism that a peer can use to avoid overflowing its queues or otherwise finding itself receiving
                more messages than it can process. Note that this method is not intended for window control. It does not affect contents returned by Basic.Get-Ok methods.
            </p>
            <ul class="rules">
                <li>
                    When a new channel is opened, it is active (flow is active). Some applications assume that channels are inactive until started. To emulate this behaviour a client MAY open the channel, then pause it.
                </li>
                <li>
                    When sending content frames, a peer SHOULD monitor the channel for incoming methods and respond to a Channel.Flow as rapidly as possible.
                </li>
                <li>
                    A peer MAY use the Channel.Flow method to throttle incoming content data for internal reasons, for example, when exchanging data over a slower connection.
                </li>
                <li>
                    The peer that requests a Channel.Flow method MAY disconnect and/or ban a peer that does not respect the request. This is to prevent badly-behaved clients from overwhelming a server.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="channel.flow.active" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="start/stop content frames" class="field-name">active</span></p>
            <p class="param-desc">
                If 1, the peer starts sending content frames. If 0, the peer stops sending content frames.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="channel.flow-ok" class="method-sig">
                <div class="method-name" title="flow-ok - id:21">flow-ok(</div>
                <div class="method-params">
                    <a href="#channel.flow-ok.active">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="current flow setting">active</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirm a flow method.</p>
            <p>
                Confirms to the peer that a flow command was received and processed.
            </p>
            <h5>Parameters:</h5>
            <p id="channel.flow-ok.active" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="current flow setting" class="field-name">active</span></p>
            <p class="param-desc">
                Confirms the setting of the processed flow method: 1 means the peer will start sending or continue to send content frames; 0 means it will not.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="channel.close" class="method-sig">
                <div class="method-name" title="close - id:40">close(</div>
                <div class="method-params">
                    <a href="#channel.close.reply-code">
                        <span class="parameter"><span class="data-type" title="short">reply-code</span>&nbsp;<span class="param-name" title="">reply-code</span></span>
                    </a>
                    ,
                    <a href="#channel.close.reply-text">
                        <span class="parameter"><span class="data-type" title="shortstr">reply-text</span>&nbsp;<span class="param-name" title="">reply-text</span></span>
                    </a>
                    ,
                    <a href="#channel.close.class-id">
                        <span class="parameter"><span class="data-type" title="short">class-id</span>&nbsp;<span class="param-name" title="failing method class">class-id</span></span>
                    </a>
                    ,
                    <a href="#channel.close.method-id">
                        <span class="parameter"><span class="data-type" title="short">method-id</span>&nbsp;<span class="param-name" title="failing method ID">method-id</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#channel.close-ok">close-ok</a></span>
                </div>
            </h5>
            <p>Request a channel close.</p>
            <p>
                This method indicates that the sender wants to close the channel. This may be due to internal conditions (e.g. a forced shut-down) or due to an error handling a specific method, i.e. an exception. When a close is due to an
                exception, the sender provides the class and method id of the method which caused the exception.
            </p>
            <ul class="rules">
                <li>
                    After sending this method, any received methods except Close and Close-OK MUST be discarded. The response to receiving a Close after sending Close must be to send Close-Ok.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="channel.close.reply-code" class="field"><a href="#domain.reply-code" title="short">reply-code</a> <span title="" class="field-name">reply-code</span></p>
            <p id="channel.close.reply-text" class="field"><a href="#domain.reply-text" title="shortstr">reply-text</a> <span title="" class="field-name">reply-text</span></p>
            <p id="channel.close.class-id" class="field"><a href="#domain.class-id" title="short">class-id</a> <span title="failing method class" class="field-name">class-id</span></p>
            <p class="param-desc">
                When the close is provoked by a method exception, this is the class of the method.
            </p>
            <p id="channel.close.method-id" class="field"><a href="#domain.method-id" title="short">method-id</a> <span title="failing method ID" class="field-name">method-id</span></p>
            <p class="param-desc">
                When the close is provoked by a method exception, this is the ID of the method.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="channel.close-ok" class="method-sig">
                <div class="method-name" title="close-ok - id:41">close-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm a channel close.</p>
            <p>
                This method confirms a Channel.Close method and tells the recipient that it is safe to release resources for the channel.
            </p>
            <ul class="rules">
                <li>
                    A peer that detects a socket closure without having received a Channel.Close-Ok handshake method SHOULD log the error.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.exchange" class="class">
            <h3 class="inline-block">exchange</h3>
            <p>Work with exchanges.</p>
            <p>
                Exchanges match and distribute messages across queues. Exchanges can be configured in the server or declared at runtime.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      exchange            = C:DECLARE  S:DECLARE-OK
                          / C:DELETE   S:DELETE-OK
                          / C:BIND     S:BIND-OK
                          / C:UNBIND   S:UNBIND-OK

            </pre>
            <p></p>
            <ul class="rules">
                <li>
                    The server MUST implement these standard exchange types: fanout, direct.
                </li>
                <li>
                    The server SHOULD implement these standard exchange types: topic, headers.
                </li>
                <li>
                    The server MUST, in each virtual host, pre-declare an exchange instance for each standard exchange type that it implements, where the name of the exchange instance, if defined, is "amq." followed by the exchange type
                    name. The server MUST, in each virtual host, pre-declare at least two direct exchange instances: one named "amq.direct", the other with no public name that serves as a default exchange for Publish methods.
                </li>
                <li>
                    The server MUST pre-declare a direct exchange with no public name to act as the default exchange for content Publish methods and for default queue bindings.
                </li>
                <li>
                    The server MUST NOT allow clients to access the default exchange except by specifying an empty exchange name in the Queue.Bind and content Publish methods.
                </li>
                <li>
                    The server MAY implement other exchange types as wanted.
                </li>
            </ul>
            <h4>Methods</h4>
            <h5 id="exchange.declare" class="method-sig">
                <div class="method-name" title="declare - id:10">declare(</div>
                <div class="method-params">
                    <a href="#exchange.declare.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.type">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="exchange type">type</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.passive">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="do not create exchange">passive</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.durable">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="request a durable exchange">durable</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.auto-delete">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="auto-delete when unused">auto-delete</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.internal">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="create internal exchange">internal</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#exchange.declare.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments for declaration">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#exchange.declare-ok">declare-ok</a></span>
                </div>
            </h5>
            <p>Verify exchange exists, create if needed.</p>
            <p>
                This method creates an exchange if it does not already exist, and if the exchange exists, verifies that it is of the correct and expected class.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD support a minimum of 16 exchanges per virtual host and ideally, impose no limit except as defined by available resources.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="exchange.declare.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="exchange.declare.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <ul class="rules">
                <li>
                    Exchange names starting with "amq." are reserved for pre-declared and standardised exchanges. The client MAY declare an exchange starting with "amq." if the passive option is set, or the exchange already exists.

                    <span>Error code: </span><a href="#constant.access-refused">access-refused</a>
                </li>
                <li>
                    The exchange name consists of a non-empty sequence of these characters: letters, digits, hyphen, underscore, period, or colon.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="exchange.declare.type" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="exchange type" class="field-name">type</span></p>
            <p class="param-desc">
                Each exchange belongs to one of a set of exchange types implemented by the server. The exchange types define the functionality of the exchange - i.e. how messages are routed through it. It is not valid or meaningful to
                attempt to change the type of an existing exchange.
            </p>
            <ul class="rules">
                <li>
                    Exchanges cannot be redeclared with different types. The client MUST not attempt to redeclare an existing exchange with a different type than used in the original Exchange.Declare method.

                    <span>Error code: </span><a href="#constant.not-allowed">not-allowed</a>
                </li>
                <li>
                    The client MUST NOT attempt to declare an exchange with a type that the server does not support.

                    <span>Error code: </span><a href="#constant.command-invalid">command-invalid</a>
                </li>
            </ul>
            <p id="exchange.declare.passive" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="do not create exchange" class="field-name">passive</span></p>
            <p class="param-desc">
                If set, the server will reply with Declare-Ok if the exchange already exists with the same name, and raise an error if not. The client can use this to check whether an exchange exists without modifying the server state. When
                set, all other method fields except name and no-wait are ignored. A declare with both passive and no-wait has no effect. Arguments are compared for semantic equivalence.
            </p>
            <ul class="rules">
                <li>
                    If set, and the exchange does not already exist, the server MUST raise a channel exception with reply code 404 (not found).
                </li>
                <li>
                    If not set and the exchange exists, the server MUST check that the existing exchange has the same values for type, durable, and arguments fields. The server MUST respond with Declare-Ok if the requested exchange matches
                    these fields, and MUST raise a channel exception if not.
                </li>
            </ul>
            <p id="exchange.declare.durable" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="request a durable exchange" class="field-name">durable</span></p>
            <p class="param-desc">
                If set when creating a new exchange, the exchange will be marked as durable. Durable exchanges remain active when a server restarts. Non-durable exchanges (transient exchanges) are purged if/when a server restarts.
            </p>
            <ul class="rules">
                <li>
                    The server MUST support both durable and transient exchanges.
                </li>
            </ul>
            <p id="exchange.declare.auto-delete" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="auto-delete when unused" class="field-name">auto-delete</span></p>
            <p class="param-desc">
                If set, the exchange is deleted when all queues have finished using it.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD allow for a reasonable delay between the point when it determines that an exchange is not being used (or no longer used), and the point when it deletes the exchange. At the least it must allow a client
                    to create an exchange and then bind a queue to it, with a small but non-zero delay between these two actions.
                </li>
                <li>
                    The server MUST ignore the auto-delete field if the exchange already exists.
                </li>
            </ul>
            <p id="exchange.declare.internal" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="create internal exchange" class="field-name">internal</span></p>
            <p class="param-desc">
                If set, the exchange may not be used directly by publishers, but only when bound to other exchanges. Internal exchanges are used to construct wiring that is not visible to applications.
            </p>
            <p id="exchange.declare.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="exchange.declare.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments for declaration" class="field-name">arguments</span></p>
            <p class="param-desc">
                A set of arguments for the declaration. The syntax and semantics of these arguments depends on the server implementation.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.declare-ok" class="method-sig">
                <div class="method-name" title="declare-ok - id:11">declare-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm exchange declaration.</p>
            <p>
                This method confirms a Declare method and confirms the name of the exchange, essential for automatically-named exchanges.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.delete" class="method-sig">
                <div class="method-name" title="delete - id:20">delete(</div>
                <div class="method-params">
                    <a href="#exchange.delete.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#exchange.delete.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#exchange.delete.if-unused">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="delete only if unused">if-unused</span></span>
                    </a>
                    ,
                    <a href="#exchange.delete.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#exchange.delete-ok">delete-ok</a></span>
                </div>
            </h5>
            <p>Delete an exchange.</p>
            <p>
                This method deletes an exchange. When an exchange is deleted all queue bindings on the exchange are cancelled.
            </p>
            <h5>Parameters:</h5>
            <p id="exchange.delete.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="exchange.delete.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <ul class="rules">
                <li>
                    The client MUST NOT attempt to delete an exchange that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
            </ul>
            <p id="exchange.delete.if-unused" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="delete only if unused" class="field-name">if-unused</span></p>
            <p class="param-desc">
                If set, the server will only delete the exchange if it has no queue bindings. If the exchange has queue bindings the server does not delete it but raises a channel exception instead.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT delete an exchange that has bindings on it, if the if-unused field is true.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="exchange.delete.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.delete-ok" class="method-sig">
                <div class="method-name" title="delete-ok - id:21">delete-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm deletion of an exchange.</p>
            <p>This method confirms the deletion of an exchange.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.bind" class="method-sig">
                <div class="method-name" title="bind - id:30">bind(</div>
                <div class="method-params">
                    <a href="#exchange.bind.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#exchange.bind.destination">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="name of the destination exchange to bind to">destination</span></span>
                    </a>
                    ,
                    <a href="#exchange.bind.source">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="name of the source exchange to bind to">source</span></span>
                    </a>
                    ,
                    <a href="#exchange.bind.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="message routing key">routing-key</span></span>
                    </a>
                    ,
                    <a href="#exchange.bind.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#exchange.bind.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments for binding">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#exchange.bind-ok">bind-ok</a></span>
                </div>
            </h5>
            <p>Bind exchange to an exchange.</p>
            <p>This method binds an exchange to an exchange.</p>
            <ul class="rules">
                <li>
                    A server MUST allow and ignore duplicate bindings - that is, two or more bind methods for a specific exchanges, with identical arguments - without treating these as an error.
                </li>
                <li>
                    A server MUST allow cycles of exchange bindings to be created including allowing an exchange to be bound to itself.
                </li>
                <li>
                    A server MUST not deliver the same message more than once to a destination exchange, even if the topology of exchanges and bindings results in multiple (even infinite) routes to that exchange.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="exchange.bind.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="exchange.bind.destination" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="name of the destination exchange to bind to" class="field-name">destination</span></p>
            <p class="param-desc">Specifies the name of the destination exchange to bind.</p>
            <ul class="rules">
                <li>
                    A client MUST NOT be allowed to bind a non-existent destination exchange.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="exchange.bind.source" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="name of the source exchange to bind to" class="field-name">source</span></p>
            <p class="param-desc">Specifies the name of the source exchange to bind.</p>
            <ul class="rules">
                <li>
                    A client MUST NOT be allowed to bind a non-existent source exchange.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="exchange.bind.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">
                Specifies the routing key for the binding. The routing key is used for routing messages depending on the exchange configuration. Not all exchanges use a routing key - refer to the specific exchange documentation.
            </p>
            <p id="exchange.bind.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="exchange.bind.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments for binding" class="field-name">arguments</span></p>
            <p class="param-desc">
                A set of arguments for the binding. The syntax and semantics of these arguments depends on the exchange class.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.bind-ok" class="method-sig">
                <div class="method-name" title="bind-ok - id:31">bind-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm bind successful.</p>
            <p>This method confirms that the bind was successful.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.unbind" class="method-sig">
                <div class="method-name" title="unbind - id:40">unbind(</div>
                <div class="method-params">
                    <a href="#exchange.unbind.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#exchange.unbind.destination">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">destination</span></span>
                    </a>
                    ,
                    <a href="#exchange.unbind.source">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">source</span></span>
                    </a>
                    ,
                    <a href="#exchange.unbind.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="routing key of binding">routing-key</span></span>
                    </a>
                    ,
                    <a href="#exchange.unbind.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#exchange.unbind.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments of binding">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#exchange.unbind-ok">unbind-ok</a></span>
                </div>
            </h5>
            <p>Unbind an exchange from an exchange.</p>
            <p>This method unbinds an exchange from an exchange.</p>
            <ul class="rules">
                <li>
                    If a unbind fails, the server MUST raise a connection exception.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="exchange.unbind.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="exchange.unbind.destination" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">destination</span></p>
            <p class="param-desc">Specifies the name of the destination exchange to unbind.</p>
            <ul class="rules">
                <li>
                    The client MUST NOT attempt to unbind an exchange that does not exist from an exchange.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="exchange.unbind.source" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">source</span></p>
            <p class="param-desc">Specifies the name of the source exchange to unbind.</p>
            <ul class="rules">
                <li>
                    The client MUST NOT attempt to unbind an exchange from an exchange that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="exchange.unbind.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="routing key of binding" class="field-name">routing-key</span></p>
            <p class="param-desc">Specifies the routing key of the binding to unbind.</p>
            <p id="exchange.unbind.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="exchange.unbind.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments of binding" class="field-name">arguments</span></p>
            <p class="param-desc">Specifies the arguments of the binding to unbind.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="exchange.unbind-ok" class="method-sig">
                <div class="method-name" title="unbind-ok - id:51">unbind-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm unbind successful.</p>
            <p>This method confirms that the unbind was successful.</p>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.queue" class="class">
            <h3 class="inline-block">queue</h3>
            <p>Work with queues.</p>
            <p>
                Queues store and forward messages. Queues can be configured in the server or created at runtime. Queues must be attached to at least one exchange in order to receive messages from publishers.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      queue               = C:DECLARE  S:DECLARE-OK
                          / C:BIND     S:BIND-OK
                          / C:UNBIND   S:UNBIND-OK
                          / C:PURGE    S:PURGE-OK
                          / C:DELETE   S:DELETE-OK

            </pre>
            <p></p>
            <h4>Methods</h4>
            <h5 id="queue.declare" class="method-sig">
                <div class="method-name" title="declare - id:10">declare(</div>
                <div class="method-params">
                    <a href="#queue.declare.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.passive">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="do not create queue">passive</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.durable">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="request a durable queue">durable</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.exclusive">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="request an exclusive queue">exclusive</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.auto-delete">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="auto-delete queue when unused">auto-delete</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#queue.declare.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments for declaration">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#queue.declare-ok">declare-ok</a></span>
                </div>
            </h5>
            <p>Declare queue, create if needed.</p>
            <p>
                This method creates or checks a queue. When creating a new queue the client can specify various properties that control the durability of the queue and its contents, and the level of sharing for the queue.
            </p>
            <ul class="rules">
                <li>
                    The server MUST create a default binding for a newly-declared queue to the default exchange, which is an exchange of type 'direct' and use the queue name as the routing key.
                </li>
                <li>
                    The server SHOULD support a minimum of 256 queues per virtual host and ideally, impose no limit except as defined by available resources.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="queue.declare.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="queue.declare.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <ul class="rules">
                <li>
                    The queue name MAY be empty, in which case the server MUST create a new queue with a unique generated name and return this to the client in the Declare-Ok method.
                </li>
                <li>
                    Queue names starting with "amq." are reserved for pre-declared and standardised queues. The client MAY declare a queue starting with "amq." if the passive option is set, or the queue already exists.

                    <span>Error code: </span><a href="#constant.access-refused">access-refused</a>
                </li>
                <li>
                    The queue name can be empty, or a sequence of these characters: letters, digits, hyphen, underscore, period, or colon.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="queue.declare.passive" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="do not create queue" class="field-name">passive</span></p>
            <p class="param-desc">
                If set, the server will reply with Declare-Ok if the queue already exists with the same name, and raise an error if not. The client can use this to check whether a queue exists without modifying the server state. When set,
                all other method fields except name and no-wait are ignored. A declare with both passive and no-wait has no effect. Arguments are compared for semantic equivalence.
            </p>
            <ul class="rules">
                <li>
                    The client MAY ask the server to assert that a queue exists without creating the queue if not. If the queue does not exist, the server treats this as a failure.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    If not set and the queue exists, the server MUST check that the existing queue has the same values for durable, exclusive, auto-delete, and arguments fields. The server MUST respond with Declare-Ok if the requested queue
                    matches these fields, and MUST raise a channel exception if not.
                </li>
            </ul>
            <p id="queue.declare.durable" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="request a durable queue" class="field-name">durable</span></p>
            <p class="param-desc">
                If set when creating a new queue, the queue will be marked as durable. Durable queues remain active when a server restarts. Non-durable queues (transient queues) are purged if/when a server restarts. Note that durable queues
                do not necessarily hold persistent messages, although it does not make sense to send persistent messages to a transient queue.
            </p>
            <ul class="rules">
                <li>
                    The server MUST recreate the durable queue after a restart.
                </li>
                <li>
                    The server MUST support both durable and transient queues.
                </li>
            </ul>
            <p id="queue.declare.exclusive" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="request an exclusive queue" class="field-name">exclusive</span></p>
            <p class="param-desc">
                Exclusive queues may only be accessed by the current connection, and are deleted when that connection closes. Passive declaration of an exclusive queue by other connections are not allowed.
            </p>
            <ul class="rules">
                <li>
                    The server MUST support both exclusive (private) and non-exclusive (shared) queues.
                </li>
                <li>
                    The client MAY NOT attempt to use a queue that was declared as exclusive by another still-open connection.

                    <span>Error code: </span><a href="#constant.resource-locked">resource-locked</a>
                </li>
            </ul>
            <p id="queue.declare.auto-delete" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="auto-delete queue when unused" class="field-name">auto-delete</span></p>
            <p class="param-desc">
                If set, the queue is deleted when all consumers have finished using it. The last consumer can be cancelled either explicitly or because its channel is closed. If there was no consumer ever on the queue, it won't be deleted.
                Applications can explicitly delete auto-delete queues using the Delete method as normal.
            </p>
            <ul class="rules">
                <li>
                    The server MUST ignore the auto-delete field if the queue already exists.
                </li>
            </ul>
            <p id="queue.declare.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="queue.declare.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments for declaration" class="field-name">arguments</span></p>
            <p class="param-desc">
                A set of arguments for the declaration. The syntax and semantics of these arguments depends on the server implementation.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.declare-ok" class="method-sig">
                <div class="method-name" title="declare-ok - id:11">declare-ok(</div>
                <div class="method-params">
                    <a href="#queue.declare-ok.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.declare-ok.message-count">
                        <span class="parameter"><span class="data-type" title="long">message-count</span>&nbsp;<span class="param-name" title="">message-count</span></span>
                    </a>
                    ,
                    <a href="#queue.declare-ok.consumer-count">
                        <span class="parameter"><span class="data-type" title="long">long</span>&nbsp;<span class="param-name" title="number of consumers">consumer-count</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirms a queue definition.</p>
            <p>
                This method confirms a Declare method and confirms the name of the queue, essential for automatically-named queues.
            </p>
            <h5>Parameters:</h5>
            <p id="queue.declare-ok.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">
                Reports the name of the queue. If the server generated a queue name, this field contains that name.
            </p>
            <p id="queue.declare-ok.message-count" class="field"><a href="#domain.message-count" title="long">message-count</a> <span title="" class="field-name">message-count</span></p>
            <p id="queue.declare-ok.consumer-count" class="field"><a href="#domain.long" title="long">long</a> <span title="number of consumers" class="field-name">consumer-count</span></p>
            <p class="param-desc">
                Reports the number of active consumers for the queue. Note that consumers can suspend activity (Channel.Flow) in which case they do not appear in this count.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.bind" class="method-sig">
                <div class="method-name" title="bind - id:20">bind(</div>
                <div class="method-params">
                    <a href="#queue.bind.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#queue.bind.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.bind.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="name of the exchange to bind to">exchange</span></span>
                    </a>
                    ,
                    <a href="#queue.bind.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="message routing key">routing-key</span></span>
                    </a>
                    ,
                    <a href="#queue.bind.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#queue.bind.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments for binding">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#queue.bind-ok">bind-ok</a></span>
                </div>
            </h5>
            <p>Bind queue to an exchange.</p>
            <p>
                This method binds a queue to an exchange. Until a queue is bound it will not receive any messages. In a classic messaging model, store-and-forward queues are bound to a direct exchange and subscription queues are bound to a
                topic exchange.
            </p>
            <ul class="rules">
                <li>
                    A server MUST allow ignore duplicate bindings - that is, two or more bind methods for a specific queue, with identical arguments - without treating these as an error.
                </li>
                <li>
                    A server MUST not deliver the same message more than once to a queue, even if the queue has multiple bindings that match the message.
                </li>
                <li>
                    The server MUST allow a durable queue to bind to a transient exchange.
                </li>
                <li>
                    Bindings of durable queues to durable exchanges are automatically durable and the server MUST restore such bindings after a server restart.
                </li>
                <li>
                    The server SHOULD support at least 4 bindings per queue, and ideally, impose no limit except as defined by available resources.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="queue.bind.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="queue.bind.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to bind.</p>
            <ul class="rules">
                <li>
                    The client MUST either specify a queue name or have previously declared a queue on the same channel

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The client MUST NOT attempt to bind a queue that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
            </ul>
            <p id="queue.bind.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="name of the exchange to bind to" class="field-name">exchange</span></p>
            <p class="param-desc">Name of the exchange to bind to.</p>
            <ul class="rules">
                <li>
                    A client MUST NOT be allowed to bind a queue to a non-existent exchange.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="queue.bind.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">
                Specifies the routing key for the binding. The routing key is used for routing messages depending on the exchange configuration. Not all exchanges use a routing key - refer to the specific exchange documentation. If the
                queue name is empty, the server uses the last queue declared on the channel. If the routing key is also empty, the server uses this queue name for the routing key as well. If the queue name is provided but the routing key is
                empty, the server does the binding with that empty routing key. The meaning of empty routing keys depends on the exchange implementation.
            </p>
            <ul class="rules">
                <li>
                    If a message queue binds to a direct exchange using routing key K and a publisher sends the exchange a message with routing key R, then the message MUST be passed to the message queue if K = R.
                </li>
            </ul>
            <p id="queue.bind.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="queue.bind.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments for binding" class="field-name">arguments</span></p>
            <p class="param-desc">
                A set of arguments for the binding. The syntax and semantics of these arguments depends on the exchange class.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.bind-ok" class="method-sig">
                <div class="method-name" title="bind-ok - id:21">bind-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm bind successful.</p>
            <p>This method confirms that the bind was successful.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.unbind" class="method-sig">
                <div class="method-name" title="unbind - id:50">unbind(</div>
                <div class="method-params">
                    <a href="#queue.unbind.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#queue.unbind.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.unbind.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#queue.unbind.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="routing key of binding">routing-key</span></span>
                    </a>
                    ,
                    <a href="#queue.unbind.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments of binding">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#queue.unbind-ok">unbind-ok</a></span>
                </div>
            </h5>
            <p>Unbind a queue from an exchange.</p>
            <p>This method unbinds a queue from an exchange.</p>
            <ul class="rules">
                <li>
                    If a unbind fails, the server MUST raise a connection exception.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="queue.unbind.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="queue.unbind.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to unbind.</p>
            <ul class="rules">
                <li>
                    The client MUST either specify a queue name or have previously declared a queue on the same channel

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The client MUST NOT attempt to unbind a queue that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
            </ul>
            <p id="queue.unbind.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <p class="param-desc">The name of the exchange to unbind from.</p>
            <ul class="rules">
                <li>
                    The client MUST NOT attempt to unbind a queue from an exchange that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
            </ul>
            <p id="queue.unbind.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="routing key of binding" class="field-name">routing-key</span></p>
            <p class="param-desc">Specifies the routing key of the binding to unbind.</p>
            <p id="queue.unbind.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments of binding" class="field-name">arguments</span></p>
            <p class="param-desc">Specifies the arguments of the binding to unbind.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.unbind-ok" class="method-sig">
                <div class="method-name" title="unbind-ok - id:51">unbind-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm unbind successful.</p>
            <p>This method confirms that the unbind was successful.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.purge" class="method-sig">
                <div class="method-name" title="purge - id:30">purge(</div>
                <div class="method-params">
                    <a href="#queue.purge.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#queue.purge.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.purge.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#queue.purge-ok">purge-ok</a></span>
                </div>
            </h5>
            <p>Purge a queue.</p>
            <p>
                This method removes all messages from a queue which are not awaiting acknowledgment.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT purge messages that have already been sent to a client but not yet acknowledged.
                </li>
                <li>
                    The server MAY implement a purge queue or log that allows system administrators to recover accidentally-purged messages. The server SHOULD NOT keep purged messages in the same storage spaces as the live messages since
                    the volumes of purged messages may get very large.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="queue.purge.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="queue.purge.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to purge.</p>
            <ul class="rules">
                <li>
                    The client MUST either specify a queue name or have previously declared a queue on the same channel

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The client MUST NOT attempt to purge a queue that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
            </ul>
            <p id="queue.purge.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.purge-ok" class="method-sig">
                <div class="method-name" title="purge-ok - id:31">purge-ok(</div>
                <div class="method-params">
                    <a href="#queue.purge-ok.message-count">
                        <span class="parameter"><span class="data-type" title="long">message-count</span>&nbsp;<span class="param-name" title="">message-count</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirms a queue purge.</p>
            <p>This method confirms the purge of a queue.</p>
            <h5>Parameters:</h5>
            <p id="queue.purge-ok.message-count" class="field"><a href="#domain.message-count" title="long">message-count</a> <span title="" class="field-name">message-count</span></p>
            <p class="param-desc">
                Reports the number of messages purged.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.delete" class="method-sig">
                <div class="method-name" title="delete - id:40">delete(</div>
                <div class="method-params">
                    <a href="#queue.delete.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#queue.delete.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#queue.delete.if-unused">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="delete only if unused">if-unused</span></span>
                    </a>
                    ,
                    <a href="#queue.delete.if-empty">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="delete only if empty">if-empty</span></span>
                    </a>
                    ,
                    <a href="#queue.delete.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#queue.delete-ok">delete-ok</a></span>
                </div>
            </h5>
            <p>Delete a queue.</p>
            <p>
                This method deletes a queue. When a queue is deleted any pending messages are sent to a dead-letter queue if this is defined in the server configuration, and all consumers on the queue are cancelled.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD use a dead-letter queue to hold messages that were pending on a deleted queue, and MAY provide facilities for a system administrator to move these messages back to an active queue.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="queue.delete.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="queue.delete.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to delete.</p>
            <ul class="rules">
                <li>
                    The client MUST either specify a queue name or have previously declared a queue on the same channel

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The client MUST NOT attempt to delete a queue that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
            </ul>
            <p id="queue.delete.if-unused" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="delete only if unused" class="field-name">if-unused</span></p>
            <p class="param-desc">
                If set, the server will only delete the queue if it has no consumers. If the queue has consumers the server does does not delete it but raises a channel exception instead.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT delete a queue that has consumers on it, if the if-unused field is true.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="queue.delete.if-empty" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="delete only if empty" class="field-name">if-empty</span></p>
            <p class="param-desc">
                If set, the server will only delete the queue if it has no messages.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT delete a queue that has messages on it, if the if-empty field is true.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="queue.delete.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="queue.delete-ok" class="method-sig">
                <div class="method-name" title="delete-ok - id:41">delete-ok(</div>
                <div class="method-params">
                    <a href="#queue.delete-ok.message-count">
                        <span class="parameter"><span class="data-type" title="long">message-count</span>&nbsp;<span class="param-name" title="">message-count</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirm deletion of a queue.</p>
            <p>This method confirms the deletion of a queue.</p>
            <h5>Parameters:</h5>
            <p id="queue.delete-ok.message-count" class="field"><a href="#domain.message-count" title="long">message-count</a> <span title="" class="field-name">message-count</span></p>
            <p class="param-desc">Reports the number of messages deleted.</p>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.basic" class="class">
            <h3 class="inline-block">basic</h3>
            <p>Work with basic content.</p>
            <p>
                The Basic class provides methods that support an industry-standard messaging model.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      basic               = C:QOS S:QOS-OK
                          / C:CONSUME S:CONSUME-OK
                          / C:CANCEL S:CANCEL-OK
                          / C:PUBLISH content
                          / S:RETURN content
                          / S:DELIVER content
                          / C:GET ( S:GET-OK content / S:GET-EMPTY )
                          / C:ACK
                          / S:ACK
                          / C:REJECT
                          / C:NACK
                          / S:NACK
                          / C:RECOVER-ASYNC
                          / C:RECOVER S:RECOVER-OK

            </pre>
            <p></p>
            <ul class="rules">
                <li>
                    The server SHOULD respect the persistent property of basic messages and SHOULD make a best-effort to hold persistent basic messages on a reliable storage mechanism.
                </li>
                <li>
                    The server MUST NOT discard a persistent basic message in case of a queue overflow.
                </li>
                <li>
                    The server MAY use the Channel.Flow method to slow or stop a basic message publisher when necessary.
                </li>
                <li>
                    The server MAY overflow non-persistent basic messages to persistent storage.
                </li>
                <li>
                    The server MAY discard or dead-letter non-persistent basic messages on a priority basis if the queue size exceeds some configured limit.
                </li>
                <li>
                    The server MUST implement at least 2 priority levels for basic messages, where priorities 0-4 and 5-9 are treated as two distinct levels.
                </li>
                <li>
                    The server MAY implement up to 10 priority levels.
                </li>
                <li>
                    The server MUST deliver messages of the same priority in order irrespective of their individual persistence.
                </li>
                <li>
                    The server MUST support un-acknowledged delivery of Basic content, i.e. consumers with the no-ack field set to TRUE.
                </li>
                <li>
                    The server MUST support explicitly acknowledged delivery of Basic content, i.e. consumers with the no-ack field set to FALSE.
                </li>
            </ul>
            <h4>Fields</h4>
            <table class="fields-table">
                <thead>
                    <tr>
                        <th>Definition</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="MIME content type" class="field-name">content-type</span></td>
                        <td>MIME content type.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="MIME content encoding" class="field-name">content-encoding</span></td>
                        <td>MIME content encoding.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.table" title="table">table</a> <span title="message header field table" class="field-name">headers</span></td>
                        <td>Message header field table.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.octet" title="octet">octet</a> <span title="non-persistent (1) or persistent (2)" class="field-name">delivery-mode</span></td>
                        <td>Non-persistent (1) or persistent (2).</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.octet" title="octet">octet</a> <span title="message priority, 0 to 9" class="field-name">priority</span></td>
                        <td>Message priority, 0 to 9.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="application correlation identifier" class="field-name">correlation-id</span></td>
                        <td>Application correlation identifier.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="address to reply to" class="field-name">reply-to</span></td>
                        <td>Address to reply to.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="message expiration specification" class="field-name">expiration</span></td>
                        <td>Message expiration specification.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="application message identifier" class="field-name">message-id</span></td>
                        <td>Application message identifier.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.timestamp" title="timestamp">timestamp</a> <span title="message timestamp" class="field-name">timestamp</span></td>
                        <td>Message timestamp.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="message type name" class="field-name">type</span></td>
                        <td>Message type name.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="creating user id" class="field-name">user-id</span></td>
                        <td>Creating user id.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="creating application id" class="field-name">app-id</span></td>
                        <td>Creating application id.</td>
                    </tr>
                    <tr>
                        <td><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="reserved, must be empty" class="field-name">reserved</span></td>
                        <td>Reserved, must be empty.</td>
                    </tr>
                </tbody>
            </table>
            <h4>Methods</h4>
            <h5 id="basic.qos" class="method-sig">
                <div class="method-name" title="qos - id:10">qos(</div>
                <div class="method-params">
                    <a href="#basic.qos.prefetch-size">
                        <span class="parameter"><span class="data-type" title="long">long</span>&nbsp;<span class="param-name" title="prefetch window in octets">prefetch-size</span></span>
                    </a>
                    ,
                    <a href="#basic.qos.prefetch-count">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="prefetch window in messages">prefetch-count</span></span>
                    </a>
                    ,
                    <a href="#basic.qos.global">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="apply to entire connection">global</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#basic.qos-ok">qos-ok</a></span>
                </div>
            </h5>
            <p>Specify quality of service.</p>
            <p>
                This method requests a specific quality of service. The QoS can be specified for the current channel or for all channels on the connection. The particular properties and semantics of a qos method always depend on the content
                class semantics. Though the qos method could in principle apply to both peers, it is currently meaningful only for the server.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.qos.prefetch-size" class="field"><a href="#domain.long" title="long">long</a> <span title="prefetch window in octets" class="field-name">prefetch-size</span></p>
            <p class="param-desc">
                The client can request that messages be sent in advance so that when the client finishes processing a message, the following message is already held locally, rather than needing to be sent down the channel. Prefetching gives
                a performance improvement. This field specifies the prefetch window size in octets. The server will send a message in advance if it is equal to or smaller in size than the available prefetch size (and also falls into other
                prefetch limits). May be set to zero, meaning "no specific limit", although other prefetch limits may still apply. The prefetch-size is ignored if the no-ack option is set.
            </p>
            <ul class="rules">
                <li>
                    The server MUST ignore this setting when the client is not processing any messages - i.e. the prefetch size does not limit the transfer of single messages to a client, only the sending in advance of more messages while
                    the client still has one or more unacknowledged messages.
                </li>
            </ul>
            <p id="basic.qos.prefetch-count" class="field"><a href="#domain.short" title="short">short</a> <span title="prefetch window in messages" class="field-name">prefetch-count</span></p>
            <p class="param-desc">
                Specifies a prefetch window in terms of whole messages. This field may be used in combination with the prefetch-size field; a message will only be sent in advance if both prefetch windows (and those at the channel and
                connection level) allow it. The prefetch-count is ignored if the no-ack option is set.
            </p>
            <ul class="rules">
                <li>
                    The server may send less data in advance than allowed by the client's specified prefetch windows but it MUST NOT send more.
                </li>
            </ul>
            <p id="basic.qos.global" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="apply to entire connection" class="field-name">global</span></p>
            <p class="param-desc">
                RabbitMQ has reinterpreted this field. The original specification said: "By default the QoS settings apply to the current channel only. If this field is set, they are applied to the entire connection." Instead, RabbitMQ
                takes global=false to mean that the QoS settings should apply per-consumer (for new consumers on the channel; existing ones being unaffected) and global=true to mean that the QoS settings should apply per-channel.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.qos-ok" class="method-sig">
                <div class="method-name" title="qos-ok - id:11">qos-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm the requested qos.</p>
            <p>
                This method tells the client that the requested QoS levels could be handled by the server. The requested QoS applies to all active consumers until a new QoS is defined.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.consume" class="method-sig">
                <div class="method-name" title="consume - id:20">consume(</div>
                <div class="method-params">
                    <a href="#basic.consume.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.consumer-tag">
                        <span class="parameter"><span class="data-type" title="shortstr">consumer-tag</span>&nbsp;<span class="param-name" title="">consumer-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.no-local">
                        <span class="parameter"><span class="data-type" title="bit">no-local</span>&nbsp;<span class="param-name" title="">no-local</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.no-ack">
                        <span class="parameter"><span class="data-type" title="bit">no-ack</span>&nbsp;<span class="param-name" title="">no-ack</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.exclusive">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="request exclusive access">exclusive</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    ,
                    <a href="#basic.consume.arguments">
                        <span class="parameter"><span class="data-type" title="table">table</span>&nbsp;<span class="param-name" title="arguments for declaration">arguments</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#basic.consume-ok">consume-ok</a></span>
                </div>
            </h5>
            <p>Start a queue consumer.</p>
            <p>
                This method asks the server to start a "consumer", which is a transient request for messages from a specific queue. Consumers last as long as the channel they were declared on, or until the client cancels them.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD support at least 16 consumers per queue, and ideally, impose no limit except as defined by available resources.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.consume.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="basic.consume.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to consume from.</p>
            <p id="basic.consume.consumer-tag" class="field"><a href="#domain.consumer-tag" title="shortstr">consumer-tag</a> <span title="" class="field-name">consumer-tag</span></p>
            <p class="param-desc">
                Specifies the identifier for the consumer. The consumer tag is local to a channel, so two clients can use the same consumer tags. If this field is empty the server will generate a unique tag.
            </p>
            <ul class="rules">
                <li>
                    The client MUST NOT specify a tag that refers to an existing consumer.

                    <span>Error code: </span><a href="#constant.not-allowed">not-allowed</a>
                </li>
                <li>
                    The consumer tag is valid only within the channel from which the consumer was created. I.e. a client MUST NOT create a consumer in one channel and then use it in another.

                    <span>Error code: </span><a href="#constant.not-allowed">not-allowed</a>
                </li>
            </ul>
            <p id="basic.consume.no-local" class="field"><a href="#domain.no-local" title="bit">no-local</a> <span title="" class="field-name">no-local</span></p>
            <p id="basic.consume.no-ack" class="field"><a href="#domain.no-ack" title="bit">no-ack</a> <span title="" class="field-name">no-ack</span></p>
            <p id="basic.consume.exclusive" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="request exclusive access" class="field-name">exclusive</span></p>
            <p class="param-desc">
                Request exclusive consumer access, meaning only this consumer can access the queue.
            </p>
            <ul class="rules">
                <li>
                    The client MAY NOT gain exclusive access to a queue that already has active consumers.

                    <span>Error code: </span><a href="#constant.access-refused">access-refused</a>
                </li>
            </ul>
            <p id="basic.consume.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <p id="basic.consume.arguments" class="field"><a href="#domain.table" title="table">table</a> <span title="arguments for declaration" class="field-name">arguments</span></p>
            <p class="param-desc">
                A set of arguments for the consume. The syntax and semantics of these arguments depends on the server implementation.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.consume-ok" class="method-sig">
                <div class="method-name" title="consume-ok - id:21">consume-ok(</div>
                <div class="method-params">
                    <a href="#basic.consume-ok.consumer-tag">
                        <span class="parameter"><span class="data-type" title="shortstr">consumer-tag</span>&nbsp;<span class="param-name" title="">consumer-tag</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirm a new consumer.</p>
            <p>
                The server provides the client with a consumer tag, which is used by the client for methods called on the consumer at a later stage.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.consume-ok.consumer-tag" class="field"><a href="#domain.consumer-tag" title="shortstr">consumer-tag</a> <span title="" class="field-name">consumer-tag</span></p>
            <p class="param-desc">
                Holds the consumer tag specified by the client or provided by the server.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.cancel" class="method-sig">
                <div class="method-name" title="cancel - id:30">cancel(</div>
                <div class="method-params">
                    <a href="#basic.cancel.consumer-tag">
                        <span class="parameter"><span class="data-type" title="shortstr">consumer-tag</span>&nbsp;<span class="param-name" title="">consumer-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.cancel.no-wait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">no-wait</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#basic.cancel-ok">cancel-ok</a></span>
                </div>
            </h5>
            <p>End a queue consumer.</p>
            <p>
                This method cancels a consumer. This does not affect already delivered messages, but it does mean the server will not send any more messages for that consumer. The client may receive an arbitrary number of messages in
                between sending the cancel method and receiving the cancel-ok reply. It may also be sent from the server to the client in the event of the consumer being unexpectedly cancelled (i.e. cancelled for any reason other than the
                server receiving the corresponding basic.cancel from the client). This allows clients to be notified of the loss of consumers due to events such as queue deletion. Note that as it is not a MUST for clients to accept this
                method from the server, it is advisable for the broker to be able to identify those clients that are capable of accepting the method, through some means of capability negotiation.
            </p>
            <ul class="rules">
                <li>
                    If the queue does not exist the server MUST ignore the cancel method, so long as the consumer tag is valid for that channel.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.cancel.consumer-tag" class="field"><a href="#domain.consumer-tag" title="shortstr">consumer-tag</a> <span title="" class="field-name">consumer-tag</span></p>
            <p id="basic.cancel.no-wait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">no-wait</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.cancel-ok" class="method-sig">
                <div class="method-name" title="cancel-ok - id:31">cancel-ok(</div>
                <div class="method-params">
                    <a href="#basic.cancel-ok.consumer-tag">
                        <span class="parameter"><span class="data-type" title="shortstr">consumer-tag</span>&nbsp;<span class="param-name" title="">consumer-tag</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Confirm a cancelled consumer.</p>
            <p>
                This method confirms that the cancellation was completed.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.cancel-ok.consumer-tag" class="field"><a href="#domain.consumer-tag" title="shortstr">consumer-tag</a> <span title="" class="field-name">consumer-tag</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.publish" class="method-sig">
                <div class="method-name" title="publish - id:40">publish(</div>
                <div class="method-params">
                    <a href="#basic.publish.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#basic.publish.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#basic.publish.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="Message routing key">routing-key</span></span>
                    </a>
                    ,
                    <a href="#basic.publish.mandatory">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="indicate mandatory routing">mandatory</span></span>
                    </a>
                    ,
                    <a href="#basic.publish.immediate">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="request immediate delivery">immediate</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Publish a message.</p>
            <p>
                This method publishes a message to a specific exchange. The message will be routed to queues as defined by the exchange configuration and distributed to any active consumers when the transaction, if any, is committed.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.publish.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="basic.publish.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <p class="param-desc">
                Specifies the name of the exchange to publish to. The exchange name can be empty, meaning the default exchange. If the exchange name is specified, and that exchange does not exist, the server will raise a channel exception.
            </p>
            <ul class="rules">
                <li>
                    The client MUST NOT attempt to publish a content to an exchange that does not exist.

                    <span>Error code: </span><a href="#constant.not-found">not-found</a>
                </li>
                <li>
                    The server MUST accept a blank exchange name to mean the default exchange.
                </li>
                <li>
                    If the exchange was declared as an internal exchange, the server MUST raise a channel exception with a reply code 403 (access refused).
                </li>
                <li>
                    The exchange MAY refuse basic content in which case it MUST raise a channel exception with reply code 540 (not implemented).
                </li>
            </ul>
            <p id="basic.publish.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="Message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">
                Specifies the routing key for the message. The routing key is used for routing messages depending on the exchange configuration.
            </p>
            <p id="basic.publish.mandatory" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="indicate mandatory routing" class="field-name">mandatory</span></p>
            <p class="param-desc">
                This flag tells the server how to react if the message cannot be routed to a queue. If this flag is set, the server will return an unroutable message with a Return method. If this flag is zero, the server silently drops the
                message.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD implement the mandatory flag.
                </li>
            </ul>
            <p id="basic.publish.immediate" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="request immediate delivery" class="field-name">immediate</span></p>
            <p class="param-desc">
                This flag tells the server how to react if the message cannot be routed to a queue consumer immediately. If this flag is set, the server will return an undeliverable message with a Return method. If this flag is zero, the
                server will queue the message, but with no guarantee that it will ever be consumed.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD implement the immediate flag.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.return" class="method-sig">
                <div class="method-name" title="return - id:50">return(</div>
                <div class="method-params">
                    <a href="#basic.return.reply-code">
                        <span class="parameter"><span class="data-type" title="short">reply-code</span>&nbsp;<span class="param-name" title="">reply-code</span></span>
                    </a>
                    ,
                    <a href="#basic.return.reply-text">
                        <span class="parameter"><span class="data-type" title="shortstr">reply-text</span>&nbsp;<span class="param-name" title="">reply-text</span></span>
                    </a>
                    ,
                    <a href="#basic.return.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#basic.return.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="Message routing key">routing-key</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Return a failed message.</p>
            <p>
                This method returns an undeliverable message that was published with the "immediate" flag set, or an unroutable message published with the "mandatory" flag set. The reply code and text provide information about the reason
                that the message was undeliverable.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.return.reply-code" class="field"><a href="#domain.reply-code" title="short">reply-code</a> <span title="" class="field-name">reply-code</span></p>
            <p id="basic.return.reply-text" class="field"><a href="#domain.reply-text" title="shortstr">reply-text</a> <span title="" class="field-name">reply-text</span></p>
            <p id="basic.return.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <p class="param-desc">
                Specifies the name of the exchange that the message was originally published to. May be empty, meaning the default exchange.
            </p>
            <p id="basic.return.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="Message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">
                Specifies the routing key name specified when the message was published.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.deliver" class="method-sig">
                <div class="method-name" title="deliver - id:60">deliver(</div>
                <div class="method-params">
                    <a href="#basic.deliver.consumer-tag">
                        <span class="parameter"><span class="data-type" title="shortstr">consumer-tag</span>&nbsp;<span class="param-name" title="">consumer-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.deliver.delivery-tag">
                        <span class="parameter"><span class="data-type" title="longlong">delivery-tag</span>&nbsp;<span class="param-name" title="">delivery-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.deliver.redelivered">
                        <span class="parameter"><span class="data-type" title="bit">redelivered</span>&nbsp;<span class="param-name" title="">redelivered</span></span>
                    </a>
                    ,
                    <a href="#basic.deliver.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#basic.deliver.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="Message routing key">routing-key</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Notify the client of a consumer message.</p>
            <p>
                This method delivers a message to the client, via a consumer. In the asynchronous message delivery model, the client starts a consumer using the Consume method, then the server responds with Deliver methods as and when
                messages arrive for that consumer.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD track the number of times a message has been delivered to clients and when a message is redelivered a certain number of times - e.g. 5 times - without being acknowledged, the server SHOULD consider the
                    message to be unprocessable (possibly causing client applications to abort), and move the message to a dead letter queue.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.deliver.consumer-tag" class="field"><a href="#domain.consumer-tag" title="shortstr">consumer-tag</a> <span title="" class="field-name">consumer-tag</span></p>
            <p id="basic.deliver.delivery-tag" class="field"><a href="#domain.delivery-tag" title="longlong">delivery-tag</a> <span title="" class="field-name">delivery-tag</span></p>
            <p id="basic.deliver.redelivered" class="field"><a href="#domain.redelivered" title="bit">redelivered</a> <span title="" class="field-name">redelivered</span></p>
            <p id="basic.deliver.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <p class="param-desc">
                Specifies the name of the exchange that the message was originally published to. May be empty, indicating the default exchange.
            </p>
            <p id="basic.deliver.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="Message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">Specifies the routing key name specified when the message was published.</p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.get" class="method-sig">
                <div class="method-name" title="get - id:70">get(</div>
                <div class="method-params">
                    <a href="#basic.get.reserved-1">
                        <span class="parameter"><span class="data-type" title="short">short</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    ,
                    <a href="#basic.get.queue">
                        <span class="parameter"><span class="data-type" title="shortstr">queue-name</span>&nbsp;<span class="param-name" title="">queue</span></span>
                    </a>
                    ,
                    <a href="#basic.get.no-ack">
                        <span class="parameter"><span class="data-type" title="bit">no-ack</span>&nbsp;<span class="param-name" title="">no-ack</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#basic.get-ok">get-ok</a> | <a href="#basic.get-empty">get-empty</a></span>
                </div>
            </h5>
            <p>Direct access to a queue.</p>
            <p>
                This method provides a direct access to the messages in a queue using a synchronous dialogue that is designed for specific types of application where synchronous functionality is more important than performance.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.get.reserved-1" class="field"><a href="#domain.short" title="short">short</a> <span title="" class="field-name">reserved-1</span></p>
            <p id="basic.get.queue" class="field"><a href="#domain.queue-name" title="shortstr">queue-name</a> <span title="" class="field-name">queue</span></p>
            <p class="param-desc">Specifies the name of the queue to get a message from.</p>
            <p id="basic.get.no-ack" class="field"><a href="#domain.no-ack" title="bit">no-ack</a> <span title="" class="field-name">no-ack</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.get-ok" class="method-sig">
                <div class="method-name" title="get-ok - id:71">get-ok(</div>
                <div class="method-params">
                    <a href="#basic.get-ok.delivery-tag">
                        <span class="parameter"><span class="data-type" title="longlong">delivery-tag</span>&nbsp;<span class="param-name" title="">delivery-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.get-ok.redelivered">
                        <span class="parameter"><span class="data-type" title="bit">redelivered</span>&nbsp;<span class="param-name" title="">redelivered</span></span>
                    </a>
                    ,
                    <a href="#basic.get-ok.exchange">
                        <span class="parameter"><span class="data-type" title="shortstr">exchange-name</span>&nbsp;<span class="param-name" title="">exchange</span></span>
                    </a>
                    ,
                    <a href="#basic.get-ok.routing-key">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="Message routing key">routing-key</span></span>
                    </a>
                    ,
                    <a href="#basic.get-ok.message-count">
                        <span class="parameter"><span class="data-type" title="long">message-count</span>&nbsp;<span class="param-name" title="">message-count</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Provide client with a message.</p>
            <p>
                This method delivers a message to the client following a get method. A message delivered by 'get-ok' must be acknowledged unless the no-ack option was set in the get method.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.get-ok.delivery-tag" class="field"><a href="#domain.delivery-tag" title="longlong">delivery-tag</a> <span title="" class="field-name">delivery-tag</span></p>
            <p id="basic.get-ok.redelivered" class="field"><a href="#domain.redelivered" title="bit">redelivered</a> <span title="" class="field-name">redelivered</span></p>
            <p id="basic.get-ok.exchange" class="field"><a href="#domain.exchange-name" title="shortstr">exchange-name</a> <span title="" class="field-name">exchange</span></p>
            <p class="param-desc">
                Specifies the name of the exchange that the message was originally published to. If empty, the message was published to the default exchange.
            </p>
            <p id="basic.get-ok.routing-key" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="Message routing key" class="field-name">routing-key</span></p>
            <p class="param-desc">Specifies the routing key name specified when the message was published.</p>
            <p id="basic.get-ok.message-count" class="field"><a href="#domain.message-count" title="long">message-count</a> <span title="" class="field-name">message-count</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.get-empty" class="method-sig">
                <div class="method-name" title="get-empty - id:72">get-empty(</div>
                <div class="method-params">
                    <a href="#basic.get-empty.reserved-1">
                        <span class="parameter"><span class="data-type" title="shortstr">shortstr</span>&nbsp;<span class="param-name" title="">reserved-1</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Indicate no messages available.</p>
            <p>
                This method tells the client that the queue has no messages available for the client.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.get-empty.reserved-1" class="field"><a href="#domain.shortstr" title="shortstr">shortstr</a> <span title="" class="field-name">reserved-1</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.ack" class="method-sig">
                <div class="method-name" title="ack - id:80">ack(</div>
                <div class="method-params">
                    <a href="#basic.ack.delivery-tag">
                        <span class="parameter"><span class="data-type" title="longlong">delivery-tag</span>&nbsp;<span class="param-name" title="">delivery-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.ack.multiple">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="acknowledge multiple messages">multiple</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Acknowledge one or more messages.</p>
            <p>
                When sent by the client, this method acknowledges one or more messages delivered via the Deliver or Get-Ok methods. When sent by server, this method acknowledges one or more messages published with the Publish method on a
                channel in confirm mode. The acknowledgement can be for a single message or a set of messages up to and including a specific message.
            </p>
            <h5>Parameters:</h5>
            <p id="basic.ack.delivery-tag" class="field"><a href="#domain.delivery-tag" title="longlong">delivery-tag</a> <span title="" class="field-name">delivery-tag</span></p>
            <p id="basic.ack.multiple" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="acknowledge multiple messages" class="field-name">multiple</span></p>
            <p class="param-desc">
                If set to 1, the delivery tag is treated as "up to and including", so that multiple messages can be acknowledged with a single method. If set to zero, the delivery tag refers to a single message. If the multiple field is 1,
                and the delivery tag is zero, this indicates acknowledgement of all outstanding messages.
            </p>
            <ul class="rules">
                <li>
                    A message MUST not be acknowledged more than once. The receiving peer MUST validate that a non-zero delivery-tag refers to a delivered message, and raise a channel exception if this is not the case. On a transacted
                    channel, this check MUST be done immediately and not delayed until a Tx.Commit.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.reject" class="method-sig">
                <div class="method-name" title="reject - id:90">reject(</div>
                <div class="method-params">
                    <a href="#basic.reject.delivery-tag">
                        <span class="parameter"><span class="data-type" title="longlong">delivery-tag</span>&nbsp;<span class="param-name" title="">delivery-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.reject.requeue">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="requeue the message">requeue</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Reject an incoming message.</p>
            <p>
                This method allows a client to reject a message. It can be used to interrupt and cancel large incoming messages, or return untreatable messages to their original queue.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD be capable of accepting and process the Reject method while sending message content with a Deliver or Get-Ok method. I.e. the server should read and process incoming methods while sending output frames.
                    To cancel a partially-send content, the server sends a content body frame of size 1 (i.e. with no data except the frame-end octet).
                </li>
                <li>
                    The server SHOULD interpret this method as meaning that the client is unable to process the message at this time.
                </li>
                <li>
                    The client MUST NOT use this method as a means of selecting messages to process.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.reject.delivery-tag" class="field"><a href="#domain.delivery-tag" title="longlong">delivery-tag</a> <span title="" class="field-name">delivery-tag</span></p>
            <p id="basic.reject.requeue" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="requeue the message" class="field-name">requeue</span></p>
            <p class="param-desc">
                If requeue is true, the server will attempt to requeue the message. If requeue is false or the requeue attempt fails the messages are discarded or dead-lettered.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT deliver the message to the same client within the context of the current channel. The recommended strategy is to attempt to deliver the message to an alternative consumer, and if that is not possible,
                    to move the message to a dead-letter queue. The server MAY use more sophisticated tracking to hold the message on the queue and redeliver it to the same client at a later stage.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.recover-async" class="method-sig">
                <div class="method-name" title="recover-async - id:100">recover-async(</div>
                <div class="method-params">
                    <a href="#basic.recover-async.requeue">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="requeue the message">requeue</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Redeliver unacknowledged messages.</p>
            <p>
                This method asks the server to redeliver all unacknowledged messages on a specified channel. Zero or more messages may be redelivered. This method is deprecated in favour of the synchronous Recover/Recover-Ok.
            </p>
            <ul class="rules">
                <li>
                    The server MUST set the redelivered flag on all messages that are resent.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.recover-async.requeue" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="requeue the message" class="field-name">requeue</span></p>
            <p class="param-desc">
                If this field is zero, the message will be redelivered to the original recipient. If this bit is 1, the server will attempt to requeue the message, potentially then delivering it to an alternative subscriber.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.recover" class="method-sig">
                <div class="method-name" title="recover - id:110">recover(</div>
                <div class="method-params">
                    <a href="#basic.recover.requeue">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="requeue the message">requeue</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Redeliver unacknowledged messages.</p>
            <p>
                This method asks the server to redeliver all unacknowledged messages on a specified channel. Zero or more messages may be redelivered. This method replaces the asynchronous Recover.
            </p>
            <ul class="rules">
                <li>
                    The server MUST set the redelivered flag on all messages that are resent.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.recover.requeue" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="requeue the message" class="field-name">requeue</span></p>
            <p class="param-desc">
                If this field is zero, the message will be redelivered to the original recipient. If this bit is 1, the server will attempt to requeue the message, potentially then delivering it to an alternative subscriber.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.recover-ok" class="method-sig">
                <div class="method-name" title="recover-ok - id:111">recover-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm recovery.</p>
            <p>
                This method acknowledges a Basic.Recover method.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="basic.nack" class="method-sig">
                <div class="method-name" title="nack - id:120">nack(</div>
                <div class="method-params">
                    <a href="#basic.nack.delivery-tag">
                        <span class="parameter"><span class="data-type" title="longlong">delivery-tag</span>&nbsp;<span class="param-name" title="">delivery-tag</span></span>
                    </a>
                    ,
                    <a href="#basic.nack.multiple">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="reject multiple messages">multiple</span></span>
                    </a>
                    ,
                    <a href="#basic.nack.requeue">
                        <span class="parameter"><span class="data-type" title="bit">bit</span>&nbsp;<span class="param-name" title="requeue the message">requeue</span></span>
                    </a>
                    )
                </div>
            </h5>
            <p>Reject one or more incoming messages.</p>
            <p>
                This method allows a client to reject one or more incoming messages. It can be used to interrupt and cancel large incoming messages, or return untreatable messages to their original queue. This method is also used by the
                server to inform publishers on channels in confirm mode of unhandled messages. If a publisher receives this method, it probably needs to republish the offending messages.
            </p>
            <ul class="rules">
                <li>
                    The server SHOULD be capable of accepting and processing the Nack method while sending message content with a Deliver or Get-Ok method. I.e. the server should read and process incoming methods while sending output
                    frames. To cancel a partially-send content, the server sends a content body frame of size 1 (i.e. with no data except the frame-end octet).
                </li>
                <li>
                    The server SHOULD interpret this method as meaning that the client is unable to process the message at this time.
                </li>
                <li>
                    The client MUST NOT use this method as a means of selecting messages to process.
                </li>
                <li>
                    A client publishing messages to a channel in confirm mode SHOULD be capable of accepting and somehow handling the Nack method.
                </li>
            </ul>
            <h5>Parameters:</h5>
            <p id="basic.nack.delivery-tag" class="field"><a href="#domain.delivery-tag" title="longlong">delivery-tag</a> <span title="" class="field-name">delivery-tag</span></p>
            <p id="basic.nack.multiple" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="reject multiple messages" class="field-name">multiple</span></p>
            <p class="param-desc">
                If set to 1, the delivery tag is treated as "up to and including", so that multiple messages can be rejected with a single method. If set to zero, the delivery tag refers to a single message. If the multiple field is 1, and
                the delivery tag is zero, this indicates rejection of all outstanding messages.
            </p>
            <ul class="rules">
                <li>
                    A message MUST not be rejected more than once. The receiving peer MUST validate that a non-zero delivery-tag refers to an unacknowledged, delivered message, and raise a channel exception if this is not the case.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <p id="basic.nack.requeue" class="field"><a href="#domain.bit" title="bit">bit</a> <span title="requeue the message" class="field-name">requeue</span></p>
            <p class="param-desc">
                If requeue is true, the server will attempt to requeue the message. If requeue is false or the requeue attempt fails the messages are discarded or dead-lettered. Clients receiving the Nack methods should ignore this flag.
            </p>
            <ul class="rules">
                <li>
                    The server MUST NOT deliver the message to the same client within the context of the current channel. The recommended strategy is to attempt to deliver the message to an alternative consumer, and if that is not possible,
                    to move the message to a dead-letter queue. The server MAY use more sophisticated tracking to hold the message on the queue and redeliver it to the same client at a later stage.
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.tx" class="class">
            <h3 class="inline-block">tx</h3>
            <p>Work with transactions.</p>
            <p>
                The Tx class allows publish and ack operations to be batched into atomic units of work. The intention is that all publish and ack requests issued within a transaction will complete successfully or none of them will. Servers
                SHOULD implement atomic transactions at least where all publish or ack requests affect a single queue. Transactions that cover multiple queues may be non-atomic, given that queues can be created and destroyed asynchronously,
                and such events do not form part of any transaction. Further, the behaviour of transactions with respect to the immediate and mandatory flags on Basic.Publish methods is not defined.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      tx                  = C:SELECT S:SELECT-OK
                          / C:COMMIT S:COMMIT-OK
                          / C:ROLLBACK S:ROLLBACK-OK

            </pre>
            <p></p>
            <ul class="rules">
                <li>
                    Applications MUST NOT rely on the atomicity of transactions that affect more than one queue.
                </li>
                <li>
                    Applications MUST NOT rely on the behaviour of transactions that include messages published with the immediate option.
                </li>
                <li>
                    Applications MUST NOT rely on the behaviour of transactions that include messages published with the mandatory option.
                </li>
            </ul>
            <h4>Methods</h4>
            <h5 id="tx.select" class="method-sig">
                <div class="method-name" title="select - id:10">select(</div>
                <div class="method-params">
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#tx.select-ok">select-ok</a></span>
                </div>
            </h5>
            <p>Select standard transaction mode.</p>
            <p>
                This method sets the channel to use standard transactions. The client must use this method at least once on a channel before using the Commit or Rollback methods.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="tx.select-ok" class="method-sig">
                <div class="method-name" title="select-ok - id:11">select-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm transaction mode.</p>
            <p>
                This method confirms to the client that the channel was successfully set to use standard transactions.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="tx.commit" class="method-sig">
                <div class="method-name" title="commit - id:20">commit(</div>
                <div class="method-params">
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#tx.commit-ok">commit-ok</a></span>
                </div>
            </h5>
            <p>Commit the current transaction.</p>
            <p>
                This method commits all message publications and acknowledgments performed in the current transaction. A new transaction starts immediately after a commit.
            </p>
            <ul class="rules">
                <li>
                    The client MUST NOT use the Commit method on non-transacted channels.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="tx.commit-ok" class="method-sig">
                <div class="method-name" title="commit-ok - id:21">commit-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm a successful commit.</p>
            <p>
                This method confirms to the client that the commit succeeded. Note that if a commit fails, the server raises a channel exception.
            </p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="tx.rollback" class="method-sig">
                <div class="method-name" title="rollback - id:30">rollback(</div>
                <div class="method-params">
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#tx.rollback-ok">rollback-ok</a></span>
                </div>
            </h5>
            <p>Abandon the current transaction.</p>
            <p>
                This method abandons all message publications and acknowledgments performed in the current transaction. A new transaction starts immediately after a rollback. Note that unacked messages will not be automatically redelivered
                by rollback; if that is required an explicit recover call should be issued.
            </p>
            <ul class="rules">
                <li>
                    The client MUST NOT use the Rollback method on non-transacted channels.

                    <span>Error code: </span><a href="#constant.precondition-failed">precondition-failed</a>
                </li>
            </ul>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="tx.rollback-ok" class="method-sig">
                <div class="method-name" title="rollback-ok - id:31">rollback-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>Confirm successful rollback.</p>
            <p>
                This method confirms to the client that the rollback succeeded. Note that if an rollback fails, the server raises a channel exception.
            </p>
            <a class="back" href="#">(back to top)</a>
        </div>
        <div id="class.confirm" class="class">
            <h3 class="inline-block">confirm</h3>
            <p>Work with confirms.</p>
            <p>
                The Confirm class allows publishers to put the channel in confirm mode and subsequently be notified when messages have been handled by the broker. The intention is that all messages published on a channel in confirm mode
                will be acknowledged at some point. By acknowledging a message the broker assumes responsibility for it and indicates that it has done something it deems reasonable with it. Unroutable mandatory or immediate messages are
                acknowledged right after the Basic.Return method. Messages are acknowledged when all queues to which the message has been routed have either delivered the message and received an acknowledgement (if required), or enqueued
                the message (and persisted it if required). Published messages are assigned ascending sequence numbers, starting at 1 with the first Confirm.Select method. The server confirms messages by sending Basic.Ack methods referring
                to these sequence numbers.
            </p>
            <p class="grammar-label">Class Grammar:</p>
            <pre class="code">
      confirm            = C:SELECT S:SELECT-OK

            </pre>
            <p></p>
            <ul class="rules">
                <li>
                    The server MUST acknowledge all messages received after the channel was put into confirm mode.
                </li>
                <li>
                    The server MUST acknowledge a message only after it was properly handled by all the queues it was delivered to.
                </li>
                <li>
                    The server MUST acknowledge an unroutable mandatory or immediate message only after it sends the Basic.Return.
                </li>
                <li>
                    No guarantees are made as to how soon a message is acknowledged. Applications SHOULD NOT make assumptions about this.
                </li>
            </ul>
            <h4>Methods</h4>
            <h5 id="confirm.select" class="method-sig">
                <div class="method-name" title="select - id:10">select(</div>
                <div class="method-params">
                    <a href="#confirm.select.nowait">
                        <span class="parameter"><span class="data-type" title="bit">no-wait</span>&nbsp;<span class="param-name" title="">nowait</span></span>
                    </a>
                    )<span class="method-retval">&nbsp;➔&nbsp;<a href="#confirm.select-ok">select-ok</a></span>
                </div>
            </h5>
            <p>.</p>
            <p>
                This method sets the channel to use publisher acknowledgements. The client can only use this method on a non-transactional channel.
            </p>
            <h5>Parameters:</h5>
            <p id="confirm.select.nowait" class="field"><a href="#domain.no-wait" title="bit">no-wait</a> <span title="" class="field-name">nowait</span></p>
            <a class="back" href="#">(back to top)</a>
            <hr />
            <h5 id="confirm.select-ok" class="method-sig">
                <div class="method-name" title="select-ok - id:11">select-ok(</div>
                <div class="method-params">)</div>
            </h5>
            <p>.</p>
            <p>
                This method confirms to the client that the channel was successfully set to use publisher acknowledgements.
            </p>
            <a class="back" href="#">(back to top)</a>
        </div>
        <hr />
        <div>

### Domains {#domains}

            <a class="back" href="#">(back to top)</a>
        </div>
        <p>The following domains are defined in the specification:</p>
        <table id="domains-table">
            <thead>
                <tr>
                    <th class="col-1">Name</th>
                    <th class="col-2">Type</th>
                    <th class="col-3">Description</th>
                </tr>
            </thead>
            <tbody>
                <tr id="domain.bit">
                    <td>bit</td>
                    <td>bit</td>
                    <td>[single bit]</td>
                </tr>
                <tr id="domain.class-id">
                    <td>class-id</td>
                    <td>short</td>
                    <td></td>
                </tr>
                <tr id="domain.consumer-tag">
                    <td>consumer-tag</td>
                    <td>shortstr</td>
                    <td>
                        Identifier for the consumer, valid within the current channel.
                    </td>
                </tr>
                <tr id="domain.delivery-tag">
                    <td>delivery-tag</td>
                    <td>longlong</td>
                    <td>
                        The server-assigned and channel-specific delivery tag
                        <ul class="rules">
                            <li>
                                The delivery tag is valid only within the channel from which the message was received. I.e. a client MUST NOT receive a message on one channel and then acknowledge it on another.
                            </li>
                            <li>
                                The server MUST NOT use a zero value for delivery tags. Zero is reserved for client use, meaning "all messages so far received".
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr id="domain.exchange-name">
                    <td>exchange-name</td>
                    <td>shortstr</td>
                    <td>
                        The exchange name is a client-selected string that identifies the exchange for publish methods.
                    </td>
                </tr>
                <tr id="domain.long">
                    <td>long</td>
                    <td>long</td>
                    <td>[32-bit integer]</td>
                </tr>
                <tr id="domain.longlong">
                    <td>longlong</td>
                    <td>longlong</td>
                    <td>[64-bit integer]</td>
                </tr>
                <tr id="domain.longstr">
                    <td>longstr</td>
                    <td>longstr</td>
                    <td>[long string]</td>
                </tr>
                <tr id="domain.message-count">
                    <td>message-count</td>
                    <td>long</td>
                    <td>
                        The number of messages in the queue, which will be zero for newly-declared queues. This is the number of messages present in the queue, and committed if the channel on which they were published is transacted, that
                        are not waiting acknowledgement.
                    </td>
                </tr>
                <tr id="domain.method-id">
                    <td>method-id</td>
                    <td>short</td>
                    <td></td>
                </tr>
                <tr id="domain.no-ack">
                    <td>no-ack</td>
                    <td>bit</td>
                    <td>
                        If this field is set the server does not expect acknowledgements for messages. That is, when a message is delivered to the client the server assumes the delivery will succeed and immediately dequeues it. This
                        functionality may increase performance but at the cost of reliability. Messages can get lost if a client dies before they are delivered to the application.
                    </td>
                </tr>
                <tr id="domain.no-local">
                    <td>no-local</td>
                    <td>bit</td>
                    <td>
                        If the no-local field is set the server will not send messages to the connection that published them.
                    </td>
                </tr>
                <tr id="domain.no-wait">
                    <td>no-wait</td>
                    <td>bit</td>
                    <td>
                        If set, the server will not respond to the method. The client should not wait for a reply method. If the server could not complete the method it will raise a channel or connection exception.
                    </td>
                </tr>
                <tr id="domain.octet">
                    <td>octet</td>
                    <td>octet</td>
                    <td>[single octet]</td>
                </tr>
                <tr id="domain.path">
                    <td>path</td>
                    <td>shortstr</td>
                    <td>
                        Unconstrained.
                    </td>
                </tr>
                <tr id="domain.peer-properties">
                    <td>peer-properties</td>
                    <td>table</td>
                    <td>
                        This table provides a set of peer properties, used for identification, debugging, and general information.
                    </td>
                </tr>
                <tr id="domain.queue-name">
                    <td>queue-name</td>
                    <td>shortstr</td>
                    <td>
                        The queue name identifies the queue within the vhost. In methods where the queue name may be blank, and that has no specific significance, this refers to the 'current' queue for the channel, meaning the last queue
                        that the client declared on the channel. If the client did not declare a queue, and the method needs a queue name, this will result in a 502 (syntax error) channel exception.
                    </td>
                </tr>
                <tr id="domain.redelivered">
                    <td>redelivered</td>
                    <td>bit</td>
                    <td>
                        This indicates that the message has been previously delivered to this or another client.
                        <ul class="rules">
                            <li>
                                The server SHOULD try to signal redelivered messages when it can. When redelivering a message that was not successfully acknowledged, the server SHOULD deliver it to the original client if possible.
                            </li>
                            <li>
                                The client MUST NOT rely on the redelivered field but should take it as a hint that the message may already have been processed. A fully robust client must be able to track duplicate received messages on
                                non-transacted, and locally-transacted channels.
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr id="domain.reply-code">
                    <td>reply-code</td>
                    <td>short</td>
                    <td>
                        The reply code. The AMQ reply codes are defined as constants at the start of this formal specification.
                    </td>
                </tr>
                <tr id="domain.reply-text">
                    <td>reply-text</td>
                    <td>shortstr</td>
                    <td>
                        The localised reply text. This text can be logged as an aid to resolving issues.
                    </td>
                </tr>
                <tr id="domain.short">
                    <td>short</td>
                    <td>short</td>
                    <td>[16-bit integer]</td>
                </tr>
                <tr id="domain.shortstr">
                    <td>shortstr</td>
                    <td>shortstr</td>
                    <td>[short string (max. 256 characters)]</td>
                </tr>
                <tr id="domain.table">
                    <td>table</td>
                    <td>table</td>
                    <td>[field table]</td>
                </tr>
                <tr id="domain.timestamp">
                    <td>timestamp</td>
                    <td>timestamp</td>
                    <td>[64-bit timestamp]</td>
                </tr>
            </tbody>
        </table>
        <hr />
        <div>

### Constants {#constants}

            <a class="back" href="#">(back to top)</a>
        </div>
        <p>Many constants are error codes. Where this is so, they fall into one of two categories:</p>
        <ul>
            <li><em>Channel Errors:</em> These are associated with failures that affect the current channel but no other channels created from the same connection.</li>
            <li><em>Connection Errors:</em> These are associated with failures that preclude any further activity on the connection and mandate its closure.</li>
        </ul>
        <p>The following constants are defined in the specification:</p>
        <table id="constants-table">
            <thead>
                <tr>
                    <th class="col-1">Name</th>
                    <th class="col-2">Value</th>
                    <th class="col-3">Error Class</th>
                    <th class="col-4">Description</th>
                </tr>
            </thead>
            <tbody>
                <tr id="constant.frame-method">
                    <td>frame-method</td>
                    <td>1</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.frame-header">
                    <td>frame-header</td>
                    <td>2</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.frame-body">
                    <td>frame-body</td>
                    <td>3</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.frame-heartbeat">
                    <td>frame-heartbeat</td>
                    <td>8</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.frame-min-size">
                    <td>frame-min-size</td>
                    <td>4096</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.frame-end">
                    <td>frame-end</td>
                    <td>206</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr id="constant.reply-success">
                    <td>reply-success</td>
                    <td>200</td>
                    <td></td>
                    <td>
                        Indicates that the method completed successfully. This reply code is reserved for future use - the current protocol design does not use positive confirmation and reply codes are sent only in case of an error.
                    </td>
                </tr>
                <tr id="constant.content-too-large">
                    <td>content-too-large</td>
                    <td>311</td>
                    <td>channel</td>
                    <td>
                        The client attempted to transfer content larger than the server could accept at the present time. The client may retry at a later time.
                    </td>
                </tr>
                <tr id="constant.no-route">
                    <td>no-route</td>
                    <td>312</td>
                    <td>channel</td>
                    <td>
                        Returned when RabbitMQ sends back with 'basic.return' when a 'mandatory' message cannot be delivered to any queue.
                    </td>
                </tr>
                <tr id="constant.no-consumers">
                    <td>no-consumers</td>
                    <td>313</td>
                    <td>channel</td>
                    <td>
                        When the exchange cannot deliver to a consumer when the immediate flag is set. As a result of pending data on the queue or the absence of any consumers of the queue.
                    </td>
                </tr>
                <tr id="constant.connection-forced">
                    <td>connection-forced</td>
                    <td>320</td>
                    <td>connection</td>
                    <td>
                        An operator intervened to close the connection for some reason. The client may retry at some later date.
                    </td>
                </tr>
                <tr id="constant.invalid-path">
                    <td>invalid-path</td>
                    <td>402</td>
                    <td>connection</td>
                    <td>
                        The client tried to work with an unknown virtual host.
                    </td>
                </tr>
                <tr id="constant.access-refused">
                    <td>access-refused</td>
                    <td>403</td>
                    <td>channel</td>
                    <td>
                        The client attempted to work with a server entity to which it has no access due to security settings.
                    </td>
                </tr>
                <tr id="constant.not-found">
                    <td>not-found</td>
                    <td>404</td>
                    <td>channel</td>
                    <td>
                        The client attempted to work with a server entity that does not exist.
                    </td>
                </tr>
                <tr id="constant.resource-locked">
                    <td>resource-locked</td>
                    <td>405</td>
                    <td>channel</td>
                    <td>
                        The client attempted to work with a server entity to which it has no access because another client is working with it.
                    </td>
                </tr>
                <tr id="constant.precondition-failed">
                    <td>precondition-failed</td>
                    <td>406</td>
                    <td>channel</td>
                    <td>
                        The client requested a method that was not allowed because some precondition failed.
                    </td>
                </tr>
                <tr id="constant.frame-error">
                    <td>frame-error</td>
                    <td>501</td>
                    <td>connection</td>
                    <td>
                        The sender sent a malformed frame that the recipient could not decode. This strongly implies a programming error in the sending peer.
                    </td>
                </tr>
                <tr id="constant.syntax-error">
                    <td>syntax-error</td>
                    <td>502</td>
                    <td>connection</td>
                    <td>
                        The sender sent a frame that contained illegal values for one or more fields. This strongly implies a programming error in the sending peer.
                    </td>
                </tr>
                <tr id="constant.command-invalid">
                    <td>command-invalid</td>
                    <td>503</td>
                    <td>connection</td>
                    <td>
                        The client sent an invalid sequence of frames, attempting to perform an operation that was considered invalid by the server. This usually implies a programming error in the client.
                    </td>
                </tr>
                <tr id="constant.channel-error">
                    <td>channel-error</td>
                    <td>504</td>
                    <td>connection</td>
                    <td>
                        The client attempted to work with a channel that had not been correctly opened. This most likely indicates a fault in the client layer.
                    </td>
                </tr>
                <tr id="constant.unexpected-frame">
                    <td>unexpected-frame</td>
                    <td>505</td>
                    <td>connection</td>
                    <td>
                        The peer sent a frame that was not expected, usually in the context of a content header and body. This strongly indicates a fault in the peer's content processing.
                    </td>
                </tr>
                <tr id="constant.resource-error">
                    <td>resource-error</td>
                    <td>506</td>
                    <td>connection</td>
                    <td>
                        The server could not complete the method because it lacked sufficient resources. This may be due to the client creating too many of some type of entity.
                    </td>
                </tr>
                <tr id="constant.not-allowed">
                    <td>not-allowed</td>
                    <td>530</td>
                    <td>connection</td>
                    <td>
                        The client tried to work with some entity in a manner that is prohibited by the server, due to security settings or by some other criteria.
                    </td>
                </tr>
                <tr id="constant.not-implemented">
                    <td>not-implemented</td>
                    <td>540</td>
                    <td>connection</td>
                    <td>
                        The client tried to use functionality that is not implemented in the server.
                    </td>
                </tr>
                <tr id="constant.internal-error">
                    <td>internal-error</td>
                    <td>541</td>
                    <td>connection</td>
                    <td>
                        The server could not complete the method because of an internal error. The server may require intervention by an operator in order to resume normal operations.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div id="help-and-feedback">
        <h2>Getting Help and Providing Feedback</h2>
        <p>
            If you have questions about the contents of this guide or any other topic related to RabbitMQ, don't hesitate to ask them using <a href="https://github.com/rabbitmq/rabbitmq-server/discussions">GitHub Discussions</a> or our
            community <a href="https://www.rabbitmq.com/discord">Discord server</a>.
        </p>
    </div>
    <div id="contribute">
        <h2>Help Us Improve the Docs &lt;3</h2>
        <p>If you'd like to contribute an improvement to the site, its source is <a href="https://github.com/rabbitmq/rabbitmq-website">available on GitHub</a>. Simply fork the repository and submit a pull request. Thank you!</p>
    </div>
</div>
