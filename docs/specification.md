---
title: Compatibility and Conformance
displayed_sidebar: docsSidebar
---
<div id="left-content">
    <div class="docSection">
        <a name="spec" class="anchor" id="spec"></a>
        <p>
            RabbitMQ core broker implements the AMQP 1.0 specification and AMQP 0-9-1 specification with a number of [AMQP 0-9-1 extensions](./extensions).
        </p>
        <p>
            AMQP 1.0 is a completely different protocol from AMQP 0-9-1 and the two use different sets of client libraries.
            RabbitMQ will continue to support AMQP 0-9-1 indefinitely while the work on the AMQP 1.0 implementation continues
            in parallel.
        </p>
        <p>
            The 0-9-1 (with and without extensions) specifications are linked to below for your convenience. To learn more about AMQP 0-9-1, please see
            [AMQP 0-9-1 Overview guide](/tutorials/amqp-concepts), [AMQP 0-9-1 specification PDF](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp0-9-1.pdf),
            [AMQP 0-9-1 Reference PDF](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp-xml-doc0-9-1.pdf), and the rest of [documentation](./index.md) for more information.
        </p>
    </div>

    <div class="docSection">
        <a name="release-version-mapping" class="anchor" id="release-version-mapping"></a>

        <table class="styled-table">
            <tbody>
                <tr>
                    <th>Protocol Version</th>
                    <th>Documentation (PDF)</th>
                    <th>Machine-Readable Spec (XML)</th>
                </tr>
                <tr>
                    <td>AMQP 1.0</td>
                    <td>
                        <a href="https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-complete-v1.0-os.pdf">Specification</a>
                    </td>
                    <td>
                        <a href="https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.xml">Full</a>
                    </td>
                </tr>
                <tr>
                    <td>AMQP 0-9-1 plus RabbitMQ extensions</td>
                    <td>
                        <a href="https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp0-9-1.pdf">Specification</a> |
                        <a href="./amqp-0-9-1-errata">Errata document</a>
                        <a href="https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp-xml-doc0-9-1.pdf">Generated Reference</a>
                    </td>
                    <td>
                        <a href="https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/xml/amqp0-9-1.extended.xml">Full Reference</a> |
                        <a href="https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/xml/amqp0-9-1.stripped.extended.xml">BSD-licensed XML</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="docSection">
        <a name="classes" class="anchor" id="classes"></a>
        <h2 class="docHeading"><a class="anchor" href="#classes">Classes from the AMQP specification, version 0-9-1</a></h2>
        <p>
            The following table describes the current implementation status of the various AMQP protocol message classes.
        </p>
        <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
            <tbody>
                <tr>
                    <th>Current Status</th>
                    <th>Class</th>
                    <th>Notes</th>
                </tr>
                <tr id="class-status-connection">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection</td>
                    <td></td>
                </tr>
                <tr id="class-status-channel">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel</td>
                    <td></td>
                </tr>
                <tr id="class-status-exchange">
                    <td class="statusCell status_ok">ok</td>
                    <td>exchange</td>
                    <td></td>
                </tr>
                <tr id="class-status-queue">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue</td>
                    <td></td>
                </tr>
                <tr id="class-status-basic">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic</td>
                    <td></td>
                </tr>
                <tr id="class-status-tx">
                    <td class="statusCell status_partial">partial</td>
                    <td>tx</td>
                    <td>See <a xmlns="https://www.rabbitmq.com/namespaces/ad-hoc/conformance" href="./semantics#tx">notes on tx support</a></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="docSection">
        <a name="methods" class="anchor" id="methods"></a>
        <h2 class="docHeading"><a class="anchor" href="#methods">Methods from the AMQP specification, version 0-9-1</a></h2>
        <p>
            The following table describes the current implementation status of the various AMQP protocol methods in each class.
        </p>
        <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
            <tbody>
                <tr>
                    <th>Current Status</th>
                    <th>Method</th>
                    <th>Notes</th>
                </tr>
                <tr id="method-status-connection.start">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.start</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.start-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.start-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.secure">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.secure</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.secure-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.secure-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.tune">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.tune</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.tune-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.tune-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.open">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.open</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.open-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.open-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.close">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.close</td>
                    <td></td>
                </tr>
                <tr id="method-status-connection.close-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>connection.close-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-channel.open">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel.open</td>
                    <td></td>
                </tr>
                <tr id="method-status-channel.open-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel.open-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-channel.flow">
                    <td class="statusCell status_partial">partial</td>
                    <td>channel.flow</td>
                    <td>active=false is not supported by the server. Limiting prefetch with <span class="code">basic.qos</span> provides much better control.</td>
                </tr>
                <tr id="method-status-channel.flow-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel.flow-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-channel.close">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel.close</td>
                    <td></td>
                </tr>
                <tr id="method-status-channel.close-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>channel.close-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-exchange.declare">
                    <td class="statusCell status_ok">ok</td>
                    <td>exchange.declare</td>
                    <td></td>
                </tr>
                <tr id="method-status-exchange.declare-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>exchange.declare-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-exchange.delete">
                    <td class="statusCell status_partial">partial</td>
                    <td>exchange.delete</td>
                    <td>
                        We have made exchange.delete into an idempotent assertion that the exchange must not exist, in the same way that exchange.declare asserts that it must.
                    </td>
                </tr>
                <tr id="method-status-exchange.delete-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>exchange.delete-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.declare">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.declare</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.declare-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.declare-ok</td>
                    <td>The consumer-count parameter is the count of all consumers, rather than only active consumers, as mandated by the specification. The former is more useful to applications.</td>
                </tr>
                <tr id="method-status-queue.bind">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.bind</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.bind-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.bind-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.unbind">
                    <td class="statusCell status_partial">partial</td>
                    <td>queue.unbind</td>
                    <td>
                        We have made queue.unbind into an idempotent assertion that the binding must not exist, in the same way that queue.bind asserts that it must.
                    </td>
                </tr>
                <tr id="method-status-queue.unbind-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.unbind-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.purge">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.purge</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.purge-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.purge-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-queue.delete">
                    <td class="statusCell status_partial">partial</td>
                    <td>queue.delete</td>
                    <td>
                        We have made queue.delete into an idempotent assertion that the queue must not exist, in the same way that queue.declare asserts that it must.
                    </td>
                </tr>
                <tr id="method-status-queue.delete-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>queue.delete-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.qos">
                    <td class="statusCell status_partial">partial</td>
                    <td>basic.qos</td>
                    <td>
                        The server supports per-consumer and per-channel limits. The <span class="code">global</span> flag is given different semantics from those in the specification. See
                        <a xmlns="https://www.rabbitmq.com/namespaces/ad-hoc/conformance" href="./consumer-prefetch">consumer prefetch</a> for more information. Prefetch size limits are not implemented.
                    </td>
                </tr>
                <tr id="method-status-basic.qos-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.qos-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.consume">
                    <td class="statusCell status_partial">partial</td>
                    <td>basic.consume</td>
                    <td>The no-local parameter is not implemented. The value of this parameter is ignored and no attempt is made to prevent a consumer from receiving messages that were published on the same connection.</td>
                </tr>
                <tr id="method-status-basic.consume-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.consume-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.cancel">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.cancel</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.cancel-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.cancel-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.publish">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.publish</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.return">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.return</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.deliver">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.deliver</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.get">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.get</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.get-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.get-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.get-empty">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.get-empty</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.ack">
                    <td class="statusCell status_ok">ok</td>
                    <td>basic.ack</td>
                    <td></td>
                </tr>
                <tr id="method-status-basic.reject">
                    <td class="statusCell status_partial">partial</td>
                    <td>basic.reject</td>
                    <td>
                        The server discards the message when requeue=false, and requeues it when requeue=true. No attempt is made to prevent redelivery to the same client. The server does not interrupt the sending of message content of a
                        rejected message, i.e. the message is always delivered in full to the client.
                    </td>
                </tr>
                <tr id="method-status-basic.recover">
                    <td class="statusCell status_partial">partial</td>
                    <td>basic.recover</td>
                    <td>Recovery with requeue=false is not supported.</td>
                </tr>
                <tr id="method-status-tx.select">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.select</td>
                    <td></td>
                </tr>
                <tr id="method-status-tx.select-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.select-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-tx.commit">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.commit</td>
                    <td></td>
                </tr>
                <tr id="method-status-tx.commit-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.commit-ok</td>
                    <td></td>
                </tr>
                <tr id="method-status-tx.rollback">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.rollback</td>
                    <td></td>
                </tr>
                <tr id="method-status-tx.rollback-ok">
                    <td class="statusCell status_ok">ok</td>
                    <td>tx.rollback-ok</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="docSection">
        <a name="rules" class="anchor" id="rules"></a>
        <h2 class="docHeading"><a class="anchor" href="#rules">Rules from the AMQP specification, version 0-9-1</a></h2>
        <p>
            The Reference column contains the class or domain, method, field and rule name where present.
        </p>
        <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
            <tbody>
                <tr>
                    <th>Current Status</th>
                    <th>Type</th>
                    <th>Actor</th>
                    <th>Reference</th>
                    <th>Text</th>
                </tr>
                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>delivery-tag / channel-local</td>
                    <td>
                        <div>
                            The delivery tag is valid only within the channel from which the message was received. I.e. a client MUST NOT receive a message on one channel and then acknowledge it on another.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>delivery-tag / non-zero</td>
                    <td>
                        <div>
                            The server MUST NOT use a zero value for delivery tags. Zero is reserved for client use, meaning "all messages so far received".
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td></td>
                    <td>redelivered / implementation</td>
                    <td>
                        <div>
                            The server SHOULD try to signal redelivered messages when it can. When redelivering a message that was not successfully acknowledged, the server SHOULD deliver it to the original client if possible.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>redelivered / hinting</td>
                    <td>
                        <div>
                            The client MUST NOT rely on the redelivered field but should take it as a hint that the message may already have been processed. A fully robust client must be able to track duplicate received messages on
                            non-transacted, and locally-transacted channels.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The client already conforms, in that it does not rely on the redelivered field, and we plan on adding duplicate tracking in a future release.
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / start / protocol-name</td>
                    <td>
                        <div>
                            If the server cannot support the protocol specified in the protocol header, it MUST respond with a valid protocol header and then close the socket connection.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / start / server-support</td>
                    <td>
                        <div>
                            The server MUST provide a protocol version that is lower than or equal to that requested by the client in the protocol header.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / start / client-support</td>
                    <td>
                        <div>
                            If the client cannot handle the protocol version suggested by the server it MUST close the socket connection without sending any further data.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>client</td>
                    <td>connection / start / server-properties / required-fields</td>
                    <td>
                        <div>
                            The properties SHOULD contain at least these fields: "host", specifying the server host name or address, "product", giving the name of the server product, "version", giving the name of the server version,
                            "platform", giving the name of the operating system, "copyright", if appropriate, and "information", giving other general information.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / start / locales / required-support</td>
                    <td>
                        <div>
                            The server MUST support at least the en_US locale.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>connection / start-ok / client-properties / required-fields</td>
                    <td>
                        <div>
                            The properties SHOULD contain at least these fields: "product", giving the name of the client product, "version", giving the name of the client version, "platform", giving the name of the operating system,
                            "copyright", if appropriate, and "information", giving other general information.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>connection / start-ok / mechanism / security</td>
                    <td>
                        <div>
                            The client SHOULD authenticate using the highest-level security profile it can handle from the list provided by the server.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>connection / start-ok / mechanism / validity</td>
                    <td>
                        <div>
                            If the mechanism field does not contain one of the security mechanisms proposed by the server in the Start method, the server MUST close the connection without sending any further data.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / tune / frame-max / minimum</td>
                    <td>
                        <div>
                            Until the frame-max has been negotiated, both peers MUST accept frames of up to frame-min-size octets large, and the minimum negotiated value for frame-max is also frame-min-size.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>connection / tune-ok / channel-max / upper-limit</td>
                    <td>
                        <div>
                            If the client specifies a channel max that is higher than the value provided by the server, the server MUST close the connection without attempting a negotiated close. The server may report the error in some
                            fashion to assist implementors.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>connection / tune-ok / frame-max / minimum</td>
                    <td>
                        <div>
                            Until the frame-max has been negotiated, both peers MUST accept frames of up to frame-min-size octets large, and the minimum negotiated value for frame-max is also frame-min-size.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>frame-min-size is 4Kb.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>connection / tune-ok / frame-max / upper-limit</td>
                    <td>
                        <div>
                            If the client specifies a frame max that is higher than the value provided by the server, the server MUST close the connection without attempting a negotiated close. The server may report the error in some
                            fashion to assist implementors.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>connection / open / virtual-host / separation</td>
                    <td>
                        <div>
                            If the server supports multiple virtual hosts, it MUST enforce a full separation of exchanges, queues, and all associated entities per virtual host. An application, connected to a specific virtual host, MUST NOT
                            be able to access resources of another virtual host.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>connection / open / virtual-host / security</td>
                    <td>
                        <div>
                            The server SHOULD verify that the client has permission to access the specified virtual host.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>connection / close / stability</td>
                    <td>
                        <div>
                            After sending this method, any received methods except Close and Close-OK MUST be discarded. The response to receiving a Close after sending Close must be to send Close-Ok.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>client</td>
                    <td>connection / close-ok / reporting</td>
                    <td>
                        <div>
                            A peer that detects a socket closure without having received a Close-Ok handshake method SHOULD log the error.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>Only the server maintains an error log.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>channel / open / state</td>
                    <td>
                        <div>
                            The client MUST NOT use this method on an already-opened channel.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>channel / flow / initial-state</td>
                    <td>
                        <div>
                            When a new channel is opened, it is active (flow is active). Some applications assume that channels are inactive until started. To emulate this behaviour a client MAY open the channel, then pause it.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">doesn't</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>channel / flow / bidirectional</td>
                    <td>
                        <div>
                            When sending content frames, a peer SHOULD monitor the channel for incoming methods and respond to a Channel.Flow as rapidly as possible.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>The server does not support blocking flow with active=true. Limiting prefetch with <span class="code">basic.qos</span> provides much better control.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>channel / flow / throttling</td>
                    <td>
                        <div>
                            A peer MAY use the Channel.Flow method to throttle incoming content data for internal reasons, for example, when exchanging data over a slower connection.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            Neither the server or the clients automatically issue a Channel.Flow.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>channel / flow / expected-behaviour</td>
                    <td>
                        <div>
                            The peer that requests a Channel.Flow method MAY disconnect and/or ban a peer that does not respect the request. This is to prevent badly-behaved clients from overwhelming a server.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>client</td>
                    <td>channel / close / stability</td>
                    <td>
                        <div>
                            After sending this method, any received methods except Close and Close-OK MUST be discarded. The response to receiving a Close after sending Close must be to send Close-Ok.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>client</td>
                    <td>channel / close-ok / reporting</td>
                    <td>
                        <div>
                            A peer that detects a socket closure without having received a Channel.Close-Ok handshake method SHOULD log the error.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>Only the server maintains an error log.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>exchange / required-types</td>
                    <td>
                        <div>
                            The server MUST implement these standard exchange types: fanout, direct.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td></td>
                    <td>exchange / recommended-types</td>
                    <td>
                        <div>
                            The server SHOULD implement these standard exchange types: topic, headers.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>exchange / required-instances</td>
                    <td>
                        <div>
                            The server MUST, in each virtual host, pre-declare an exchange instance for each standard exchange type that it implements, where the name of the exchange instance, if defined, is "amq." followed by the exchange
                            type name.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>exchange / default-exchange</td>
                    <td>
                        <div>
                            The server MUST pre-declare a direct exchange with no public name to act as the default exchange for content Publish methods and for default queue bindings.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>exchange / default-access</td>
                    <td>
                        <div>
                            The server MUST NOT allow clients to access the default exchange except by specifying an empty exchange name in the Queue.Bind and content Publish methods.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>MAY</td>
                    <td></td>
                    <td>exchange / extensions</td>
                    <td>
                        <div>
                            The server MAY implement other exchange types as wanted.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>exchange / declare / minimum</td>
                    <td>
                        <div>
                            The server SHOULD support a minimum of 16 exchanges per virtual host and ideally, impose no limit except as defined by available resources.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST, MAY</td>
                    <td>server</td>
                    <td>exchange / declare / exchange / reserved</td>
                    <td>
                        <div>
                            Exchange names starting with "amq." are reserved for pre-declared and standardised exchanges. The client MAY declare an exchange starting with "amq." if the passive option is set, or the exchange already exists.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The server does not prevent exchange names starting with "amq." from being declared. Clients may declare exchanges starting with "amq." without the passive bit set.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>exchange / declare / exchange / syntax</td>
                    <td>
                        <div>
                            The exchange name consists of a non-empty sequence of these characters: letters, digits, hyphen, underscore, period, or colon.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The lexicon is not enforced by the server.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>exchange / declare / type / typed</td>
                    <td>
                        <div>
                            Exchanges cannot be redeclared with different types. The client MUST not attempt to redeclare an existing exchange with a different type than used in the original Exchange.Declare method.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>exchange / declare / type / support</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to declare an exchange with a type that the server does not support.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>exchange / declare / passive / not-found</td>
                    <td>
                        <div>
                            If set, and the exchange does not already exist, the server MUST raise a channel exception with reply code 404 (not found).
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>(refers to the passive flag)</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>exchange / declare / passive / equivalent</td>
                    <td>
                        <div>
                            If not set and the exchange exists, the server MUST check that the existing exchange has the same values for type, durable, and arguments fields. The server MUST respond with Declare-Ok if the requested exchange
                            matches these fields, and MUST raise a channel exception if not.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>(refers to the passive flag)</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>exchange / declare / durable / support</td>
                    <td>
                        <div>
                            The server MUST support both durable and transient exchanges.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">failing</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>exchange / delete / exchange / exists</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to delete an exchange that does not exist.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            We have made exchange.delete into an idempotent assertion that the exchange must not exist, in the same way that exchange.declare asserts that it must.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>exchange / delete / if-unused / in-use</td>
                    <td>
                        <div>
                            The server MUST NOT delete an exchange that has bindings on it, if the if-unused field is true.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / default-binding</td>
                    <td>
                        <div>
                            The server MUST create a default binding for a newly-declared queue to the default exchange, which is an exchange of type 'direct' and use the queue name as the routing key.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>queue / declare / minimum-queues</td>
                    <td>
                        <div>
                            The server SHOULD support a minimum of 256 queues per virtual host and ideally, impose no limit except as defined by available resources.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>MAY, MUST</td>
                    <td>server</td>
                    <td>queue / declare / queue / default-name</td>
                    <td>
                        <div>
                            The queue name MAY be empty, in which case the server MUST create a new queue with a unique generated name and return this to the client in the Declare-Ok method.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / queue / reserved</td>
                    <td>
                        <div>
                            Queue names starting with "amq." are reserved for pre-declared and standardised queues. The client MAY declare a queue starting with "amq." if the passive option is set, or the queue already exists.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The server does not prevent queue names starting with "amq." from being declared. Clients may declare queues starting with "amq." without the passive bit set.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>queue / declare / queue / syntax</td>
                    <td>
                        <div>
                            The queue name can be empty, or a sequence of these characters: letters, digits, hyphen, underscore, period, or colon.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The lexicon is not enforced by the server.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>queue / declare / passive / passive</td>
                    <td>
                        <div>
                            The client MAY ask the server to assert that a queue exists without creating the queue if not. If the queue does not exist, the server treats this as a failure.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / passive / equivalent</td>
                    <td>
                        <div>
                            If not set and the queue exists, the server MUST check that the existing queue has the same values for durable, exclusive, auto-delete, and arguments fields. The server MUST respond with Declare-Ok if the
                            requested queue matches these fields, and MUST raise a channel exception if not.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>(refers to the passive flag)</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / durable / persistence</td>
                    <td><div>The server MUST recreate the durable queue after a restart.</div></td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / durable / types</td>
                    <td><div>The server MUST support both durable and transient queues.</div></td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / exclusive / types</td>
                    <td>
                        <div>
                            The server MUST support both exclusive (private) and non-exclusive (shared) queues.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY NOT</td>
                    <td>server</td>
                    <td>queue / declare / exclusive / exclusive</td>
                    <td>
                        <div>
                            The client MAY NOT attempt to use a queue that was declared as exclusive by another still-open connection.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / declare / auto-delete / pre-existence</td>
                    <td>
                        <div>
                            The server MUST ignore the auto-delete field if the queue already exists.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / duplicates</td>
                    <td>
                        <div>
                            A server MUST allow ignore duplicate bindings - that is, two or more bind methods for a specific queue, with identical arguments - without treating these as an error.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / bind / unique</td>
                    <td>
                        <div>
                            A server MUST not deliver the same message more than once to a queue, even if the queue has multiple bindings that match the message.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / transient-exchange</td>
                    <td>
                        <div>
                            The server MUST allow a durable queue to bind to a transient exchange.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / durable-exchange</td>
                    <td>
                        <div>
                            Bindings of durable queues to durable exchanges are automatically durable and the server MUST restore such bindings after a server restart.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>queue / bind / binding-count</td>
                    <td>
                        <div>
                            The server SHOULD support at least 4 bindings per queue, and ideally, impose no limit except as defined by available resources.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / queue / queue-known</td>
                    <td>
                        <div>
                            The client MUST either specify a queue name or have previously declared a queue on the same channel
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / bind / queue / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to bind a queue that does not exist.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / bind / exchange / exchange-existence</td>
                    <td>
                        <div>
                            A client MUST NOT be allowed to bind a queue to a non-existent exchange.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_doesn't">doesn't</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / exchange / default-exchange</td>
                    <td>
                        <div>
                            The server MUST accept a blank exchange name to mean the default exchange.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / bind / routing-key / direct-exchange-key-matching</td>
                    <td>
                        <div>
                            If a message queue binds to a direct exchange using routing key K and a publisher sends the exchange a message with routing key R, then the message MUST be passed to the message queue if K = R.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / unbind / 01</td>
                    <td><div>If a unbind fails, the server MUST raise a connection exception.</div></td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / unbind / queue / queue-known</td>
                    <td>
                        <div>
                            The client MUST either specify a queue name or have previously declared a queue on the same channel
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">failing</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / unbind / queue / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to unbind a queue that does not exist.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            We have made queue.unbind into an idempotent assertion that the binding must not exist, in the same way that queue.bind asserts that it must.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">failing</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / unbind / exchange / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to unbind a queue from an exchange that does not exist.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            We have made queue.unbind into an idempotent assertion that the binding must not exist, in the same way that queue.bind asserts that it must.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_doesn't">doesn't</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / unbind / exchange / default-exchange</td>
                    <td>
                        <div>
                            The server MUST accept a blank exchange name to mean the default exchange.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / purge / 02</td>
                    <td>
                        <div>
                            The server MUST NOT purge messages that have already been sent to a client but not yet acknowledged.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>queue / purge / 03</td>
                    <td>
                        <div>
                            The server MAY implement a purge queue or log that allows system administrators to recover accidentally-purged messages. The server SHOULD NOT keep purged messages in the same storage spaces as the live messages
                            since the volumes of purged messages may get very large.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / purge / queue / queue-known</td>
                    <td>
                        <div>
                            The client MUST either specify a queue name or have previously declared a queue on the same channel
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / purge / queue / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to purge a queue that does not exist.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">doesn't</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>queue / delete / 01</td>
                    <td>
                        <div>
                            The server SHOULD use a dead-letter queue to hold messages that were pending on a deleted queue, and MAY provide facilities for a system administrator to move these messages back to an active queue.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>queue / delete / queue / queue-known</td>
                    <td>
                        <div>
                            The client MUST either specify a queue name or have previously declared a queue on the same channel
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">failing</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / delete / queue / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to delete a queue that does not exist.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            We have made queue.delete into an idempotent assertion that the queue must not exist, in the same way that queue.declare asserts that it must.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / delete / if-unused / in-use</td>
                    <td>
                        <div>
                            The server MUST NOT delete a queue that has consumers on it, if the if-unused field is true.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>queue / delete / if-empty / not-empty</td>
                    <td>
                        <div>
                            The server MUST NOT delete a queue that has messages on it, if the if-empty field is true.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td></td>
                    <td>basic / 01</td>
                    <td>
                        <div>
                            The server SHOULD respect the persistent property of basic messages and SHOULD make a best-effort to hold persistent basic messages on a reliable storage mechanism.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>basic / 02</td>
                    <td>
                        <div>
                            The server MUST NOT discard a persistent basic message in case of a queue overflow.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td></td>
                    <td>basic / 03</td>
                    <td>
                        <div>
                            The server MAY use the Channel.Flow method to slow or stop a basic message publisher when necessary.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>MAY</td>
                    <td></td>
                    <td>basic / 04</td>
                    <td>
                        <div>
                            The server MAY overflow non-persistent basic messages to persistent storage.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td></td>
                    <td>basic / 05</td>
                    <td>
                        <div>
                            The server MAY discard or dead-letter non-persistent basic messages on a priority basis if the queue size exceeds some configured limit.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>MUST</td>
                    <td></td>
                    <td>basic / 06</td>
                    <td>
                        <div>
                            The server MUST implement at least 2 priority levels for basic messages, where priorities 0-4 and 5-9 are treated as two distinct levels.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td></td>
                    <td>basic / 07</td>
                    <td>
                        <div>
                            The server MAY implement up to 10 priority levels.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>basic / 08</td>
                    <td>
                        <div>
                            The server MUST deliver messages of the same priority in order irrespective of their individual persistence.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>basic / 09</td>
                    <td>
                        <div>
                            The server MUST support un-acknowledged delivery of Basic content, i.e. consumers with the no-ack field set to TRUE.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td></td>
                    <td>basic / 10</td>
                    <td>
                        <div>
                            The server MUST support explicitly acknowledged delivery of Basic content, i.e. consumers with the no-ack field set to FALSE.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / qos / prefetch-size / 01</td>
                    <td>
                        <div>
                            The server MUST ignore this setting when the client is not processing any messages - i.e. the prefetch size does not limit the transfer of single messages to a client, only the sending in advance of more messages
                            while the client still has one or more unacknowledged messages.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>(refers to prefetch-size)</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>basic / qos / prefetch-count / 01</td>
                    <td>
                        <div>
                            The server may send less data in advance than allowed by the client's specified prefetch windows but it MUST NOT send more.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>basic / consume / 01</td>
                    <td>
                        <div>
                            The server SHOULD support at least 16 consumers per queue, and ideally, impose no limit except as defined by available resources.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>basic / consume / consumer-tag / 01</td>
                    <td>
                        <div>
                            The client MUST NOT specify a tag that refers to an existing consumer.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / consume / consumer-tag / 02</td>
                    <td>
                        <div>
                            The consumer tag is valid only within the channel from which the consumer was created. I.e. a client MUST NOT create a consumer in one channel and then use it in another.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY NOT</td>
                    <td>server</td>
                    <td>basic / consume / exclusive / 01</td>
                    <td>
                        <div>
                            The client MAY NOT gain exclusive access to a queue that already has active consumers.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / cancel / 01</td>
                    <td>
                        <div>
                            If the queue does not exist the server MUST ignore the cancel method, so long as the consumer tag is valid for that channel.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>basic / publish / exchange / must-exist</td>
                    <td>
                        <div>
                            The client MUST NOT attempt to publish a content to an exchange that does not exist.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / publish / exchange / default-exchange</td>
                    <td>
                        <div>
                            The server MUST accept a blank exchange name to mean the default exchange.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / publish / exchange / 02</td>
                    <td>
                        <div>
                            If the exchange was declared as an internal exchange, the server MUST raise a channel exception with a reply code 403 (access refused).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>MAY</td>
                    <td>server</td>
                    <td>basic / publish / exchange / 03</td>
                    <td>
                        <div>
                            The exchange MAY refuse basic content in which case it MUST raise a channel exception with reply code 540 (not implemented).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>basic / publish / mandatory / 01</td>
                    <td>
                        <div>
                            The server SHOULD implement the mandatory flag.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">doesn't</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>basic / publish / immediate / 01</td>
                    <td>
                        <div>
                            The server SHOULD implement the immediate flag.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>The server does not support the immediate flag. <a xmlns="https://www.rabbitmq.com/namespaces/ad-hoc/conformance" href="./ttl">message TTLs</a> of 0 offer an alternative.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>SHOULD</td>
                    <td>client</td>
                    <td>basic / deliver / 01</td>
                    <td>
                        <div>
                            The server SHOULD track the number of times a message has been delivered to clients and when a message is redelivered a certain number of times - e.g. 5 times - without being acknowledged, the server SHOULD
                            consider the message to be unprocessable (possibly causing client applications to abort), and move the message to a dead letter queue.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / ack / multiple / exists</td>
                    <td>
                        <div>
                            The server MUST validate that a non-zero delivery-tag refers to a delivered message, and raise a channel exception if this is not the case. On a transacted channel, this check MUST be done immediately and not
                            delayed until a Tx.Commit. Specifically, a client MUST not acknowledge the same message more than once.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>basic / reject / 01</td>
                    <td>
                        <div>
                            The server SHOULD be capable of accepting and process the Reject method while sending message content with a Deliver or Get-Ok method. I.e. the server should read and process incoming methods while sending output
                            frames. To cancel a partially-send content, the server sends a content body frame of size 1 (i.e. with no data except the frame-end octet).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>SHOULD</td>
                    <td>server</td>
                    <td>basic / reject / 02</td>
                    <td>
                        <div>
                            The server SHOULD interpret this method as meaning that the client is unable to process the message at this time.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>basic / reject / 03</td>
                    <td>
                        <div>
                            The client MUST NOT use this method as a means of selecting messages to process.
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>basic / reject / requeue / 01</td>
                    <td>
                        <div>
                            The server MUST NOT deliver the message to the same client within the context of the current channel. The recommended strategy is to attempt to deliver the message to an alternative consumer, and if that is not
                            possible, to move the message to a dead-letter queue. The server MAY use more sophisticated tracking to hold the message on the queue and redeliver it to the same client at a later stage.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / recover-async / 01</td>
                    <td>
                        <div>
                            The server MUST set the redelivered flag on all messages that are resent.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST</td>
                    <td>server</td>
                    <td>basic / recover / 01</td>
                    <td>
                        <div>
                            The server MUST set the redelivered flag on all messages that are resent.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>tx / not multiple queues</td>
                    <td>
                        <div>
                            Applications MUST NOT rely on the atomicity of transactions that affect more than one queue.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>tx / not immediate</td>
                    <td>
                        <div>
                            Applications MUST NOT rely on the behaviour of transactions that include messages published with the immediate option.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td></td>
                    <td>tx / not mandatory</td>
                    <td>
                        <div>
                            Applications MUST NOT rely on the behaviour of transactions that include messages published with the mandatory option.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>tx / commit / transacted</td>
                    <td>
                        <div>
                            The client MUST NOT use the Commit method on non-transacted channels.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>MUST NOT</td>
                    <td>server</td>
                    <td>tx / rollback / transacted</td>
                    <td>
                        <div>
                            The client MUST NOT use the Rollback method on non-transacted channels.
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="docSection">
        <a name="rules-pdf" class="anchor" id="rules-pdf"></a>
        <h2 class="docHeading"><a class="anchor" href="#rules-pdf">Rules from the AMQP specification, version 0-9-1 (PDF)</a></h2>
        <p>
            The rules listed below are from the PDF version of the 0-9-1 specification, wherever MUST, SHOULD or MAY appear in the text.
        </p>
        <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
            <tbody>
                <tr>
                    <th>Current Status</th>
                    <th>Type</th>
                    <th>Actor</th>
                    <th>Reference</th>
                    <th>Text</th>
                </tr>
                <tr>
                    <td class="statusCell status_ok">does, doesn't</td>
                    <td>
                        SHOULD, SHOULD
                    </td>
                    <td></td>
                    <td>1.4.1</td>
                    <td>
                        <div>
                            Protocol constants are shown as upper-case names. AMQP implementations SHOULD use these names when defining and using constants in source code and documentation. Property names, method arguments, and frame fields
                            are shown as lower-case names. AMQP implementations SHOULD use these names consistently in source code and documentation.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            Property names, method arguments, and frame fields legitimately appear as camel-case in some contexts.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>2.2.4</td>
                    <td>
                        <div>
                            There is no hand-shaking for errors on connections that are not fully open. Following successful protocol header negotiation, [...] and prior to sending or receiving Open or Open-Ok, a peer that detects an error
                            MUST close the socket without sending any further data.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>2.3.3</td>
                    <td>
                        <div>
                            The server MAY host multiple protocols on the same port.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span>The server supports 0-8, 0-9 and 0-9-1 on the same port.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>2.3.3</td>
                    <td>
                        <div>
                            Agreed limits MAY enable both parties to pre-allocate key buffers, avoiding deadlocks.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>2.3.3</td>
                    <td>
                        <div>
                            Every incoming frame either obeys the agreed limits, and so is "safe", or exceeds them, in which case the other party IS faulty and MUST be disconnected.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>2.3.3</td>
                    <td>
                        <div>
                            The server MUST tell the client what limits it proposes.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>2.3.3</td>
                    <td>
                        <div>
                            The client responds and MAY reduce those limits for its connection.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>2.3.5.2</td>
                    <td>
                        <div>
                            The data [for content frames] can be any size, and MAY be broken into several (or many) chunks, each forming a "content body frame".
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST, MUST
                    </td>
                    <td></td>
                    <td>2.3.7</td>
                    <td>
                        <div>
                            A connection or channel is considered “open” for the client when it has sent Open, and for the server when it has sent Open-Ok. From this point onwards a peer that wishes to close the channel or connection MUST
                            do so using a hand-shake protocol [...]. When a peer decides to close a channel or connection, it sends a Close method. The receiving peer MUST respond to a Close with a Close-Ok, and then both parties can close
                            their channel or connection.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_failing">does</td>
                    <td>
                        MUST NOT, MUST NOT
                    </td>
                    <td></td>
                    <td>3.1.1</td>
                    <td>
                        <div>
                            The server MUST NOT modify message content bodies that it receives and passes to consumer applications. [...] [The server] MUST NOT remove or modify existing information.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            "BCC" headers are removed from properties after routing.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>3.1.1</td>
                    <td>
                        <div>
                            The server MAY add information to content headers [...]
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>3.1.2</td>
                    <td>
                        <div>
                            Each connection MUST BE associated with a single virtual host.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>3.1.2</td>
                    <td>
                        <div>
                            [The] authorisation scheme used MAY be unique to each virtual host.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST, MUST
                    </td>
                    <td></td>
                    <td>3.1.3.1</td>
                    <td>
                        <div>
                            The server MUST implement the direct exchange type and MUST pre-declare within each virtual host at least two direct exchanges: one named amq.direct, and one with no public name that serves as the default
                            exchange for Publish methods. [...] [All] message queues MUST BE automatically bound to the nameless exchange using the message queue's name as routing key.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>3.1.3.3</td>
                    <td>
                        <div>
                            The routing key used for a topic exchange MUST consist of zero or more words delimited by dots.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does, ok</td>
                    <td>
                        SHOULD, MUST
                    </td>
                    <td></td>
                    <td>3.1.3.3</td>
                    <td>
                        <div>
                            The server SHOULD implement the topic exchange type and in that case, the server MUST pre-declare within each virtual host at least one topic exchange, named amq.topic.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does, ok</td>
                    <td>
                        SHOULD, MUST
                    </td>
                    <td></td>
                    <td>3.1.3.4</td>
                    <td>
                        <div>
                            The server SHOULD implement the headers exchange type and in that case, the server MUST pre-declare within each virtual host at least one headers exchange, named amq.match.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>3.1.3.4</td>
                    <td>
                        <div>
                            All non-normative exchange types MUST be named starting with "x-".
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        MAY NOT
                    </td>
                    <td></td>
                    <td>3.1.4</td>
                    <td>
                        <div>
                            Note that in the presence of multiple readers from a queue, or client transactions, or use of priority fields, or use of message selectors, or implementation-specific delivery optimisations the queue MAY NOT
                            exhibit true FIFO characteristics.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            FIFO characteristics are guaranteed under the conditions specified in section 4.7.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>3.1.10</td>
                    <td>
                        <div>
                            The server and client MUST respect [the specified naming] conventions
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        SHOULD
                    </td>
                    <td></td>
                    <td>3.2.1</td>
                    <td>
                        <div>
                            The AMQP methods may define specific minimal values (such as numbers of consumers per message queue) for interoperability reasons. These minima are defined in the description of each class. Conforming AMQP
                            implementations SHOULD implement reasonably generous values for such fields, the minima is only intended for use on the least capable platforms.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does, doesn't</td>
                    <td>
                        SHOULD, MAY
                    </td>
                    <td></td>
                    <td>3.2.1</td>
                    <td>
                        <div>
                            The sending peer SHOULD wait for the specific reply method [after sending a synchronous request], but MAY implement this asynchronously
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.2</td>
                    <td>
                        <div>
                            The client MUST start a new connection by sending a protocol header.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>4.2.2</td>
                    <td>
                        <div>
                            The server MAY accept non-AMQP protocols such as HTTP.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The core broker accepts only AMQP. Plugins exist for other protocols.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.2</td>
                    <td>
                        <div>
                            If the server does not recognise the first 5 octets of data on the socket, or does not support the specific protocol version that the client requests, it MUST write a valid protocol header to the socket, then
                            flush the socket (to ensure the client application will receive the data) and then close the socket connection.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>4.2.2</td>
                    <td>
                        <div>
                            The server MAY print a diagnostic message [during failed protocol negotiation] to assist debugging.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            Relevant information will be written to the server log.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't</td>
                    <td>
                        MAY
                    </td>
                    <td></td>
                    <td>4.2.2</td>
                    <td>
                        <div>
                            The client MAY detect the server protocol version by attempting to connect with its highest supported version and reconnecting with a lower version if it receives such information back from the server.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.3</td>
                    <td>
                        <div>
                            The frame-end octet MUST always be the hexadecimal value %xCE.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST, MUST, MUST
                    </td>
                    <td></td>
                    <td>4.2.3</td>
                    <td>
                        <div>
                            If a peer receives a frame with a type that is not one of these defined types, it MUST treat this as a fatal protocol error and close the connection without sending any further data on it. When a peer reads a
                            frame it MUST check that the frame-end is valid before attempting to decode the frame. If the frame-end is not valid it MUST treat this as a fatal protocol error and close the connection without sending any
                            further data on it.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        SHOULD
                    </td>
                    <td></td>
                    <td>4.2.3</td>
                    <td>
                        <div>
                            It SHOULD log information about the [frame decoding] problem, since this indicates an error in either the server or client framing code implementation.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST NOT, MUST, MUST, MUST, MUST
                    </td>
                    <td></td>
                    <td>4.2.3</td>
                    <td>
                        <div>
                            A peer MUST NOT send frames larger than the agreed-upon size. A peer that receives an oversized frame MUST signal a connection exception with reply code 501 (frame error). The channel number MUST be zero for all
                            heartbeat frames, and for method, header and body frames that refer to the Connection class. A peer that receives a non-zero channel number for one of these frames MUST signal a connection exception with reply
                            code 503 (command invalid).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST NOT
                    </td>
                    <td></td>
                    <td>4.2.5.1</td>
                    <td>
                        <div>
                            Implementers MUST NOT assume that integers encoded in a frame are aligned on memory word boundaries.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.5.5</td>
                    <td>
                        <div>
                            Field names MUST start with a letter, '$' or '#' [...]
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">doesn't, doesn't</td>
                    <td>
                        SHOULD, SHOULD
                    </td>
                    <td></td>
                    <td>4.2.5.5</td>
                    <td>
                        <div>
                            The server SHOULD validate field names and upon receiving an invalid field name, it SHOULD signal a connection exception with reply code 503 (syntax error).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_planned">planned</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.6</td>
                    <td>
                        <div>
                            A peer that receives an incomplete or badly-formatted content MUST raise a connection exception with reply code 505 (unexpected frame).
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The given reply code is not returned for all possible ways in which content can be badly-formatted.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST, MUST
                    </td>
                    <td></td>
                    <td>4.2.6.1</td>
                    <td>
                        <div>
                            The class-id [of the content header] MUST match the method frame class id. The peer MUST respond to an invalid class-id by raising a connection exception with reply code 501 (frame error).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST NOT, MUST
                    </td>
                    <td></td>
                    <td>4.2.6.1</td>
                    <td>
                        <div>
                            The channel number in content frames MUST NOT be zero. A peer that receives a zero channel number in a content frame MUST signal a connection exception with reply code 504 (channel error).
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.6.2</td>
                    <td>
                        <div>
                            A peer MUST handle a content body that is split into multiple frames by storing these frames as a single set, and either retransmitting them as-is, broken into smaller frames, or concatenated into a single block
                            for delivery to an application.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.6.2</td>
                    <td>
                        <div>
                            Heartbeat frames MUST have a channel number of zero.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.2.7</td>
                    <td>
                        <div>
                            If the peer does not support heartbeating it MUST discard the heartbeat frame without signalling any error or fault.
                        </div>
                        <div class="notes">
                            <span class="leader">Notes: </span>
                            The broker and supported clients do support heartbeat frames.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does, doesn't</td>
                    <td>
                        MAY, MAY
                    </td>
                    <td></td>
                    <td>4.3</td>
                    <td>
                        <div>
                            An AMQP peer MAY support multiple channels. The maximum number of channels is defined at connection negotiation, and a peer MAY negotiate this down to 1.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does, doesn't</td>
                    <td>
                        SHOULD, SHOULD NOT
                    </td>
                    <td></td>
                    <td>4.3</td>
                    <td>
                        <div>
                            Each peer SHOULD balance the traffic on all open channels in a fair fashion. This balancing can be done on a per-frame basis, or on the basis of amount of traffic per channel. A peer SHOULD NOT allow one very
                            busy channel to starve the progress of a less busy channel.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST NOT, MUST
                    </td>
                    <td></td>
                    <td>4.6</td>
                    <td>
                        <div>
                            The effects of the request-response MUST NOT be visible on the channel before the response method, and MUST be visible thereafter.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">ok</td>
                    <td>
                        MUST
                    </td>
                    <td></td>
                    <td>4.7</td>
                    <td>
                        <div>
                            The server MUST preserve the order of contents flowing through a single content processing path, unless the redelivered field is set on the Basic.Deliver or Basic.Get-Ok methods, and according to the rules
                            governing the conditions under which that field can be set.
                        </div>
                        <div class="notes"><span class="leader">Notes: </span> The broker makes <a xmlns="https://www.rabbitmq.com/namespaces/ad-hoc/conformance" href="./semantics#ordering">stronger guarantees</a>.</div>
                    </td>
                </tr>

                <tr>
                    <td class="statusCell status_ok">does</td>
                    <td>
                        SHOULD
                    </td>
                    <td></td>
                    <td>4.10.2</td>
                    <td>
                        <div>
                            The server SHOULD log all [exceptions during connection negotiation stage] and flag or block clients provoking multiple failures.
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="docSection">
        <a name="deprecated-classes" class="anchor" id="deprecated-classes"></a>
        <h2 class="docHeading"><a class="anchor" href="#deprecated-classes">Deprecated classes</a></h2>
        <p>
            The following classes were deprecated in version 0-9-1. RabbitMQ does not implement these classes at all, including when the broker is connected to a version 0-8 client, or when the .NET client is configured to use 0-8.
        </p>
        <ul>
            <li>access</li>
            <li>dtx</li>
            <li>file</li>
            <li>stream</li>
            <li>test</li>
            <li>tunnel</li>
        </ul>
        <p></p>
        <p>
            See also the detailed specification compatibility tables below.
        </p>
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
