---
title: Broker Semantics
displayed_sidebar: docsSidebar
---
<div id="left-content">
    <p class="intro">
        Here we describe the broker semantics. This should be read together with the AMQP specification.
    </p>
    <div class="docSection">
        <a name="tx" class="anchor" id="tx"></a>
        <h2 class="docHeading"><a class="anchor" href="#tx">Semantics of tx</a></h2>
        <p>The semantics of AMQP's <span class="code">tx</span> class, as defined in AMQP 0-9-1, and its implementation in different versions of the RabbitMQ server, is often misunderstood. Here is a summary of the behaviour:</p>
        <table>
            <tbody>
                <tr>
                    <th>Feature</th>
                    <th>
                        AMQP<br />
                        0-9-1
                    </th>
                    <th>
                        RabbitMQ<br />
                        &lt; 2.6.0
                    </th>
                    <th>
                        RabbitMQ<br />
                        2.6.0-2.7.1
                    </th>
                    <th>
                        RabbitMQ<br />
                        &gt;= 2.8.0
                    </th>
                </tr>
                <tr>
                    <td>transactional <span class="code">basic.publish</span></td>
                    <td>yes</td>
                    <td>yes</td>
                    <td>yes</td>
                    <td>yes</td>
                </tr>
                <tr>
                    <td>transactional <span class="code">basic.ack</span></td>
                    <td>yes</td>
                    <td>yes</td>
                    <td>yes</td>
                    <td>yes</td>
                </tr>
                <tr>
                    <td>transactional <span class="code">basic.reject</span></td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                    <td>yes</td>
                </tr>
                <tr>
                    <td>transactional exchange/queue/binding creation/deletion</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                </tr>
                <tr>
                    <td>transactional consuming/getting of messages</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                </tr>
                <tr>
                    <td>atomicity in single queue</td>
                    <td>yes</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                </tr>
                <tr>
                    <td>atomicity across multiple queues</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                    <td>no</td>
                </tr>
                <tr>
                    <td>error detection (e.g. invalid exchange)</td>
                    <td>undefined</td>
                    <td>immediate</td>
                    <td>immediate</td>
                    <td>immediate</td>
                </tr>
                <tr>
                    <td>sending of 'no_route' <span class="code">basic.return</span></td>
                    <td>undefined</td>
                    <td>immediate</td>
                    <td>on commit</td>
                    <td>on commit</td>
                </tr>
                <tr>
                    <td>effect visibility / responsibility transfer / durability</td>
                    <td>undefined</td>
                    <td>on commit</td>
                    <td>on commit</td>
                    <td>on commit</td>
                </tr>
            </tbody>
        </table>
        <p>Overall the behaviour of the AMQP <span class="code">tx</span> class, and more so its implementation on RabbitMQ, is closer to providing a 'batching' feature than ACID capabilities known from the database world.</p>
        <p>
            AMQP transactions only apply to publishes and acks. We have additionally made rejection transactional. Other operations such as resource creation/deletion are not transactional. Consequently
            <em>the behaviour of transactions when any of the involved exchanges, queues or bindings are altered is undefined</em>.
        </p>
        <p>
            On the consuming side, the <em>acknowledgements</em> are transactional, not the consuming of the messages themselves. Hence no requeuing of consumed messages takes place on rollback; the client can still ack/reject these
            messages in subsequent transactions.
        </p>
        <p>
            AMQP guarantees atomicity only when transactions involve a single queue, i.e. all the publishes inside the tx get routed to a single queue and all acks relate to messages consumed from the same queue. When multiple queues are
            involved it is possible that in the event of a broker failure during <span class="code">tx.commit</span> the effects of the transaction are only visible in some of the queues. Furthermore, RabbitMQ provides no atomicity
            guarantees even in case of transactions involving just a single queue, e.g. a fault during <span class="code">tx.commit</span> can result in a sub-set of the transaction's publishes appearing in the queue after a broker restart.
        </p>
        <p>
            AMQP does not specify when errors (e.g. lack of permissions, references to unknown exchanges) in transactional <span class="code">basic.publish</span> and <span class="code">basic.ack</span> commands should be detected. RabbitMQ
            performs the necessary checks immediately (rather than, say, at the time of commit), but note that both <span class="code">basic.publish</span> and <span class="code">basic.ack</span>
            are asynchronous commands so any errors will be reported back to the client asynchronously.
        </p>
        <p>
            The situation is similar with <span class="code">basic.return</span>s, though note the slight change in behaviour between earlier and recent versions of RabbitMQ. You will always receive any
            <span class="code">basic.return</span>s before the <span class="code">tx.commit-ok</span>.
        </p>
        <p>
            AMQP does not specify when the effects of transactions should become visible following a <span class="code">tx.commit</span>, e.g. when published messages will appear in queues and can be consumed from other clients, when
            persistent messages will be written to disk, etc. In RabbitMQ the <span class="code">tx.commit-ok</span> indicates that all transaction effects are visible and that the broker has accepted responsibility for all the messages
            published in the transaction.
        </p>
        <p>
            For acknowledgements, the receipt of a
            <span class="code">tx.commit-ok</span> is an indicator that the acknowledgements have been received by the server, <em>not</em> that they have been processed, persisted, etc. Consequently it is possible for a subsequent
            server-side failure to "resurrect" the acknowledged messages, and for consuming clients to receive them again.
        </p>
    </div>
    <div class="docSection">
        <a name="ordering" class="anchor" id="ordering"></a>
        <h2 class="docHeading"><a class="anchor" href="#ordering">Message ordering guarantees</a></h2>
        <p>
            Section 4.7 of the AMQP 0-9-1 core specification explains the conditions under which ordering is guaranteed: messages published in one channel, passing through one exchange and one queue and one outgoing channel will be received
            in the same order that they were sent. RabbitMQ offers stronger guarantees since release 2.7.0.
        </p>
        <p>
            Messages can be returned to the queue using AMQP methods that feature a requeue parameter (<span class="code">basic.recover</span>, <span class="code">basic.reject</span> and <span class="code">basic.nack</span>), or due to a
            channel closing while holding unacknowledged messages. Any of these scenarios caused messages to be requeued at the back of the queue for RabbitMQ releases earlier than 2.7.0. From RabbitMQ release 2.7.0, messages are always
            held in the queue in publication order, even in the presence of requeueing or channel closure.
        </p>
        <p>
            With release 2.7.0 and later it is still possible for individual consumers to observe messages out of order if the queue has multiple subscribers. This is due to the actions of other subscribers who may requeue messages. From
            the perspective of the queue the messages are always held in the publication order.
        </p>
    </div>

    <div class="docSection">
        <a name="exclusive-durable" class="anchor" id="exclusive-durable"></a>
        <h2 class="docHeading"><a class="anchor" href="#exclusive-durable">Exclusive queues, durability and mirroring</a></h2>
        <p>
            An exclusive queue is one which is deleted whenever the connection that declares it is closed. Although AMQP 0-9-1 allows you to declare a durable exclusive queue, the durability is meaningless since the queue will vanish anyway
            as soon as the broker stops. Therefore RabbitMQ will ignore the durable flag in a declaration of an exclusive queue and create an exclusive transient queue.
        </p>

        <p>
            Similarly, there is no benefit to mirroring an exclusive queue, since such a queue will be deleted when the node it was declared on shuts down. Therefore RabbitMQ will never mirror exclusive queues.
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
