<div id="left-content">
    <h1>AMQP 0-9-1 Errata</h1>
    <p class="intro">
        Here we list errors and ambiguities in the 0-9-1 specification and provide our interpretations and corrections.
    </p>
    <div class="docSection">
        <a name="section_1" class="anchor" id="section_1"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_1">1 Use of "consumer"</a></h2>
    </div>
    <p>
        The word "consumer" is used fairly indiscriminately. In general, we've interpreted it to mean "client", except in situations in which it clearly refers specifically to a triple
        <span class="code">&lcub;connection, channel, consumer-tag}</span>.
    </p>
    <p>An example of the first, generic meaning is in channel.flow: "This method asks the peer to pause or restart the flow of content data sent by a consumer."</p>
    <p>An example of the second, specific use is in basic.consume: "Request exclusive consumer access, meaning only this consumer can access the queue."</p>
    <p>(This should really be cleaned up in subsequent revisions of the specification.)</p>

    <div class="docSection">
        <a name="section_2" class="anchor" id="section_2"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_2">2 basic.recover with requeue=false</a></h2>
    </div>
    <p>The stanza for basic.recover says</p>
    <p>"This method asks the server to redeliver all unacknowledged messages on a specified channel. Zero or more messages may be redelivered."</p>
    <p>and</p>
    <p>"If [requeue] is zero, the message will be redelivered to the original recipient. If this bit is 1, the server will attempt to requeue the message, potentially then delivering it to an alternative subscriber."</p>
    <p>These don't account for</p>
    <ul class="plain">
        <li>Messages that were handed over as a result of basic.get; or,</li>
        <li>Consumers that have since since cancelled.</li>
    </ul>
    <p>RabbitMQ doesn't try to redeliver messages that were sent as a response to basic.get, and doesn't attempt to find out if a consumer has been cancelled.</p>
    <p>(Probably the best solution to this under-specification is to remove the requeue flag and just always requeue things.)</p>

    <div class="docSection">
        <a name="section_3" class="anchor" id="section_3"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_3">3 Field types</a></h2>
    </div>
    <p>Tony to the AMQ dev list:</p>
    <pre>
The changes from 0-9's table field type definitions (S,I,D,T,F,V) to
0-9-1's type definitions (t,b,B,U,u,I,i,L,l,f,d,D,s,S,A,T,F,V) are not,
as far as I can tell, the changes that were discussed in the 0-9-1 SIG.

The types mentioned in the final spec do not line up with any of the
variants discussed in the 0-9-1 SIG. In particular, they are
gratuitously <b></b>INCOMPATIBLE<b></b> with the Qpid-java 0-9 field type
extensions, which are also implemented by the RabbitMQ client libraries
and the RabbitMQ broker.

The final word I can find on the subject by trawling my archive is a
message from John O'Hara (attached). Unless there was subsequent
discussion that I've missed, I would have expected the final version of
the 0-9-1 spec to at least be based on the list John provided.

Here's a tabular summary of the state of things:

  0-9   0-9-1   Qpid/Rabbit  Type               Remarks
---------------------------------------------------------------------------
        t       t            Boolean
        b       b            Signed 8-bit
        B       B            Unsigned 8-bit
        U       s            Signed 16-bit      (A1)
        u       u            Unsigned 16-bit
  I     I       I            Signed 32-bit
        i       i            Unsigned 32-bit
        L       l            Signed 64-bit      (B)
        l                    Unsigned 64-bit
        f       f            32-bit float
        d       d            64-bit float
  D     D       D            Decimal
        s                    Short string       (A2)
  S     S       S            Long string
        A       A            Array              (C)
  T     T       T            Timestamp (u64)
  F     F       F            Nested Table
  V     V       V            Void
                x            Byte array         (D)

Remarks:

 A1, A2: Notice how the types <b></b>CONFLICT<b></b> here. In Qpid and Rabbit,
         's' means a signed 16-bit integer; in 0-9-1, it means a
         short string.

 B: Notice how the signednesses <b></b>CONFLICT<b></b> here. In Qpid and Rabbit,
    'l' means a signed 64-bit integer; in 0-9-1, it means an unsigned
    64-bit integer.

 C: I cannot find any discussion about the addition of this. Is my
    archive missing a few messages?

 D: John [O'Hara]objected to this when John proposed a list himself. I believe it to
    be vital: byte arrays are not strings. Furthermore, Qpid and
    Rabbit already have code deployed that uses this type specifier.
</pre>
    <p>RabbitMQ continues to use the tags in the third column.</p>
    <p>Other notes:</p>
    <ul class="plain">
        <li>
            Decimals encoding: "They are encoded as an octet representing the number of places followed by a long signed integer", but the grammar contradicts that and says: "decimal-value = scale long-uint". We treat the decimal value as
            <b>signed</b> integer.
        </li>
    </ul>

    <div class="docSection">
        <a name="section_4" class="anchor" id="section_4"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_4">4 field-array</a></h2>
    </div>
    <p>The protocol grammar has a production for <span class="code">field-array</span>, and it appears on the right-hand-side of a production for <span class="code">field-value</span>.</p>
    <pre>field-array = long-int *field-value</pre>
    <p>
        There is no explanation elsewhere for this, as there is for <span class="code">field-table</span>. In particular, there is nothing explaining what the long-int value represents. RabbitMQ uses the total length in bytes of the encoded
        field-values, similarly to field-table; it also treats it as a long-uint, since that is what field-table uses (on the supposition that "long-int" is a typo).
    </p>

    <div class="docSection">
        <a name="section_5" class="anchor" id="section_5"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_5">5 Exclusive and auto-delete deletion</a></h2>
    </div>
    <p>AMQP 0-8 and 0-9-1 both have rules regarding deletion of exclusive and auto-delete queues. However, they do not specify whether this happens synchronously; i.e., before the broker responds to its peer.</p>
    <p>(Actually 0-8 said that the server should wait a "polite amount of time").</p>
    <p>RabbitMQ now deletes auto-delete and queues synchronously with basic.cancel, channel close, and connection close, and exclusive queues synchronously with the latter two.</p>
    <p>An auto-delete queue will not be deleted if:</p>
    <ul class="plain">
        <li>it didn't have a consumer - consuming with <span class="code">basic.get</span> does not count as having a consumer</li>
        <li>the consumer failed to send <span class="code">basic.cancel</span> (e.g. consumer crashed)</li>
    </ul>

    <div class="docSection">
        <a name="section_6" class="anchor" id="section_6"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_6">6 Queue and exchange "equivalent" and "pre-existence" rules</a></h2>
    </div>
    <p>
        "If [passive] not set and the queue exists, the server MUST check that the existing queue has the same values for durable, exclusive, auto-delete, and arguments fields. The server MUST respond with Declare-Ok if the requested queue
        matches these fields, and MUST raise a channel exception if not."
    </p>
    <p>and similarly for exchange declaration.</p>
    <p>The rules fail to specify the exact error code. RabbitMQ uses 'precondition-failed'.</p>
    <p>
        Furthermore, the exchange.declare specs contain a separate "typed" rule concerning the re-declaration with a different type. That rule is superfluous, since it subsumed by the equivalence rules, and specifies a
        <b>connection</b> error of 'not-allowed'. The rule should be removed.
    </p>

    <div class="docSection">
        <a name="section_7" class="anchor" id="section_7"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_7">7 Exclusive rule (amqp0-9-1.xml:1503)</a></h2>
    </div>
    <p>"One client declares an exclusive queue. A second client on a different connection attempts to declare, bind, consume, purge, delete, or declare a queue of the same name."</p>
    <p>
        "declare" appears twice, and basic.get and queue.unbind not at all (basic.cancel is local to a channel anyway). RabbitMQ extends the exclusivity to queue.declare (including passive declare), queue.bind, queue.unbind, queue.purge,
        queue.delete, basic.consume, and basic.get.
    </p>

    <div class="docSection">
        <a name="section_8" class="anchor" id="section_8"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_8">8 Exclusive and other errors</a></h2>
    </div>
    <p>In general, RabbitMQ privileges exclusivity ahead of other things; i.e., it checks that first, and will send a resource-locked even if there are other problems, like non-equivalence.</p>

    <div class="docSection">
        <a name="section_9" class="anchor" id="section_9"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_9">9 Passive and no-wait (amqp0-9-1.xml:1214,1423)</a></h2>
    </div>
    <p>".. A declare with both passive and no-wait has no effect."</p>
    <p>
        However, passively declaring a queue which exists and is exclusive to another connection is explicitly prohibited in the exclusive rule (amqp0-9-1.xml:1486), and passively declaring a queue or exchange that doesn't exist should send
        a channel exception. RabbitMQ ignores the sentence quoted above; i.e., it will send a channel exception if a queue exclusive to another connection, or a non-existent queue or exchange, is passively declared even with no-wait.
    </p>

    <div class="docSection">
        <a name="section_10" class="anchor" id="section_10"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_10">10 Special case value for channel-max and frame-max</a></h2>
    </div>
    <p>
        The spec for the channel-max field in connection.tune says "Zero indicates no specified limit" and there is a similar special case for frame-max; but, in tune-ok, the "upper-limit" rule says: "If the client specifies a channel max
        [/frame-max]that is higher than the value provided by the server, the server MUST close the connection without attempting a negotiated close".
    </p>
    <p>This is ambiguous if the server sends zero in tune: if the rule is taken literally, the client is not allowed to send any value other than zero in tune-ok, so it can't negotiate down the limit.</p>
    <p>RabbitMQ doesn't put a limit on channel-max, and treats any number in tune-ok as valid. It does put a limit on frame-max, and checks that the value sent in tune-ok is less than or equal.</p>

    <div class="docSection">
        <a name="section_11" class="anchor" id="section_11"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_11">11 frame-max, method and content header frames</a></h2>
    </div>
    <p>
        The specification states that frame-max (negotiated in connection.tune and connection.tune-ok) gives an upper limit to total frame size; that is, including the frame header and frame-end octet. However, there's no way to split
        methods or content headers across multiple frames. RabbitMQ currently ignores the frame-max for methods and content headers.
    </p>

    <div class="docSection">
        <a name="section_12" class="anchor" id="section_12"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_12">12 Heartbeat format</a></h2>
    </div>
    <p>The grammar has the production</p>
    <p>heartbeat = %d8 %d0 %d0 frame-end</p>
    <p>which doesn't fit the frame format. RabbitMQ, Qpid and OpenAMQ all send eight bytes, following the frame format:</p>
    <p>frame-type (octet) = %d8 channel (short) = %d0 %d0 payload (long) = %d0 %d0 %d0 %d0 frame-end (octet) = %xCE</p>

    <div class="docSection">
        <a name="section_13" class="anchor" id="section_13"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_13">13 Heartbeat monitoring</a></h2>
    </div>
    <p>The spec says:</p>
    <pre>
The client should start sending heartbeats after receiving a Connection.Tune
method, and start monitoring heartbeats after receiving Connection.Open.
    </pre>
    <p>but of course, the client <b class="">sends</b> Connection.Open.</p>

    <div class="docSection">
        <a name="section_14" class="anchor" id="section_14"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_14">14 Default exchange</a></h2>
    </div>
    <p>The spec is a bit vague on the default exchange: it says</p>
    <pre>
The server MUST NOT allow clients to access the default exchange except
by specifying an empty exchange name in the Queue.Bind and content Publish
methods.
    </pre>
    <p>However, 0-10 spec makes things a bit more rigid:</p>
    <pre>
The default exchange MUST NOT be accessible to the client except by
specifying an empty exchange name in a content publish command (such as
message.transfer). That is, the server must not let clients explicitly
bind, unbind, delete, or make any other reference to this exchange.
    </pre>
    <p>
        RabbitMQ prevents all access to the default exchange other than publishing. This includes exchange redeclaration and queue.bind redeclarations to queues. For exchange-to-exchange bindings, neither the source or the destination are
        permitted to be the default exchange.
    </p>

    <div class="docSection">
        <a name="section_15" class="anchor" id="section_15"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_15">15 EBNF Grammar</a></h2>
    </div>
    <p>
        The EBNF grammar (p. 32) is broken: <tt class="">8\*OCTET</tt> should be <tt class="">8 OCTET</tt>, according to the syntax description <tt class="">8\*OCTET</tt> means <b class="">AT LEAST</b> 8 octets (see bullet point 'The Operator
        "\*" ...').
    </p>

    <div class="docSection">
        <a name="section_16" class="anchor" id="section_16"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_16">16 Strings vs bytes</a></h2>
    </div>
    <p>
        The spec is confused about utf-8 strings vs. raw bytes. E.g. what's a "character"? A valid code point? An octet? What does equality mean? Same bytes? Same in some normal form? How is mal-formed utf-8 handled? The grammar on p. 31
        suggests strings are just raw bytes (i.e. can contain invalid utf-8), but other parts of the spec seem to contradict that (e.g. 4.2.5.3, p. 35)
    </p>

    <div class="docSection">
        <a name="section_17" class="anchor" id="section_17"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_17">17 Missing 312 ("No route") channel exception</a></h2>
    </div>
    <p>Section 1.2 ought to define an exception 312 "No route", which used to exist in 0-9 and is what RabbitMQ sends back with 'basic.return' when a 'mandatory' message cannot be delivered to any queue.</p>

    <div class="docSection">
        <a name="section_18" class="anchor" id="section_18"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_18">18 502 channel exception</a></h2>
    </div>
    <p>Section 1.1 under queue-name says "If the client did not declare a queue, and the method needs a queue name, this will result in a 502 (syntax error) channel exception". This is in fact a connection exception.</p>

    <div class="docSection">
        <a name="section_19" class="anchor" id="section_19"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_19">19 auto-delete vs exclusive</a></h2>
    </div>
    <p>Section 4.5 says "When the server closes a connection, it deletes any auto-delete owned by that connection." That's not what auto-delete means - this should presumably say "...deletes any exclusive queues owned...".</p>

    <div class="docSection">
        <a name="section_20" class="anchor" id="section_20"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_20">20 Durability of amq.* exchanges</a></h2>
    </div>
    <p>
        The spec doesn't say if the standard exchanges should be durable or not. RabbitMQ declares them as durable. Unfortunately, the Qpid Java Client forcibly declares them as non durable (through N levels of abstractions), thus breaking
        interoperability almost completely.
    </p>

    <div class="docSection">
        <a name="section_21" class="anchor" id="section_21"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_21">21 Rejecting messages with an unknown delivery tag</a></h2>
    </div>
    <p>The spec doesn't say what should happen when a client sends a basic.reject with an unknown delivery tag. The server should probably handle this in the same way as for basic.ack, namely a raise a precondition_failed error.</p>

    <div class="docSection">
        <a name="section_22" class="anchor" id="section_22"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_22">22 Heartbeat errors</a></h2>
    </div>
    <p>
        In section 4.2.7 the spec says "A peer that receives an invalid heartbeat frame MUST raise a connection exception with reply code 501 (frame error)." It is unclear how a heartbeat frame can be identified as such and be invalid
        simultaneously.
    </p>

    <div class="docSection">
        <a name="section_23" class="anchor" id="section_23"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_23">23 Required server-properties</a></h2>
    </div>
    <p>
        The xml spec for connection.start states that the server-properties field "SHOULD contain at least these fields: 'host', specifying the server host name or address ...". The 'host' field was added to this list in 0-9; it is not
        present in 0-8. It is the only field whose value isn't freely chosen by the implementation. Furthermore, it is not clear at all what information should be included here and what a client could learn from that. The hostname may not
        identify a broker uniquely. And it may not be DNS resolvable. And the presence of firewalls and proxies makes the same true of the IP address. Additionally, including this information may reveal details of the brokers network
        infrastructure to clients that ought to remain hidden.
    </p>
    <p>Therefore this field should not be required. RabbitMQ does not supply it.</p>

    <div class="docSection">
        <a name="section_24" class="anchor" id="section_24"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_24">24 'nowait' on all synchronous commands</a></h2>
    </div>
    <p>
        All synchronous commands should have a 'nowait' flag that makes them asynchronous, unless there are specific circumstances where that doesn't make sense. Currently falling foul of this are: 'queue.unbind', 'basic.qos',
        'basic.recover' (which instead has a sync and async variant), 'tx.select', 'tx.commit', 'tx.rollback'. Of these, 'queue.unbind' is the most glaring departure from the established pattern.
    </p>

    <div class="docSection">
        <a name="section_25" class="anchor" id="section_25"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_25">25 Deprecation of auto-delete exchanges</a></h2>
    </div>
    <p>The 'auto-delete' flag on 'exchange.declare' got deprecated in 0-9-1. Auto-delete exchanges are actually quite useful, so this flag should be restored.</p>
    <p>Also note that the spec still refers to auto-delete exchanges: "Exchanges may be durable, temporary, or auto-deleted." (p. 26).</p>
    <p>RabbitMQ supports auto-delete exchanges.</p>

    <div class="docSection">
        <a name="section_26" class="anchor" id="section_26"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_26">26 Deprecation of internal exchanges</a></h2>
    </div>
    <p>
        The 'internal' flag on 'exchange.declare' got deprecated in 0-9-1. Internal exchanges (which 0-8 defines as exchanges used for internal wiring to which clients are not allowed to publish directly) are actually quite useful,
        particular in combination with extensions such as exchange-to-exchange bindings. So this flag should be restored.
    </p>
    <p>Also note that the basic publish rule (02) still makes reference to internal exchanges: "If the exchange was declared as an internal exchange..."</p>

    <div class="docSection">
        <a name="section_27" class="anchor" id="section_27"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_27">27 Basic content field explanation references queues</a></h2>
    </div>
    <p>
        The XML comments on the basic content fields state that "delivery-mode" is for "for queues that implement persistence". That is misleading (in that it mentions queues) and circular. The delivery-mode controls whether messages
        survive a broker restart.
    </p>
    <p>Similarly, the comments state that "priority" is "for queues that implement priorities". Priorities can be taken into account by a broker in all stages of message processing, not just when enqueuing.</p>
    <p>And on a cosmetic note, the vertical alignment of the basic content definitions is slightly off.</p>

    <div class="docSection">
        <a name="section_28" class="anchor" id="section_28"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_28">28 basic.recover synchronicity</a></h2>
    </div>
    <p>Although basic.recover is introduced as a synchronous version of basic.recover-async, it is not marked as synchronous in the XML spec.</p>

    <div class="docSection">
        <a name="section_29" class="anchor" id="section_29"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_29">29 Heartbeat frametype inconsistency</a></h2>
    </div>
    <p>The PDF specifies the heartbeat frametype as 4. The XML specifies it as 8.</p>

    <div class="docSection">
        <a name="section_30" class="anchor" id="section_30"></a>
        <h2 class="docHeading"><a class="anchor" href="#section_30">30 durable vs exclusive</a></h2>
    </div>
    <p>The spec does not define what happens if a client tries to declare a queue which is both durable and exclusive. RabbitMQ will treat a request to declare such a queue as a request for an exclusive transient queue.</p>
    <div id="help-and-feedback">
        <h2>Getting Help and Providing Feedback</h2>
        <p>
            If you have questions about the contents of this guide or any other topic related to RabbitMQ, don't hesitate to ask them using <a href="https://github.com/rabbitmq/rabbitmq-server/discussions">GitHub Discussions</a> or our
            community <a href="https://rabbitmq.com/discord">Discord server</a>.
        </p>
    </div>
    <div id="contribute">
        <h2>Help Us Improve the Docs &lt;3</h2>
        <p>If you'd like to contribute an improvement to the site, its source is <a href="https://github.com/rabbitmq/rabbitmq-website">available on GitHub</a>. Simply fork the repository and submit a pull request. Thank you!</p>
    </div>
</div>
