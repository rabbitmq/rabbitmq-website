---
title: Interoperability
displayed_sidebar: clientLibsSidebar
---
<div id="left-content">
    <div class="docSection">
        <a name="qpid" class="anchor" id="qpid"></a>
        <h2 class="docHeading"><a class="anchor" href="#qpid">Interoperation with Qpid</a></h2>

        <p>We have performed basic interoperability testing against <a href="http://qpid.apache.org/documentation.html#doc06">Qpid's 0.6 release</a>. So far, we have tested:</p>

        <p></p>
        <ul class="compact">
            <li>Qpid's 0.6 clients against the RabbitMQ broker</li>
            <li>the RabbitMQ clients against Qpid's 0.6 Java broker</li>
            <li>Qpid's <a href="https://cwiki.apache.org/confluence/display/qpid/PythonBrokerTest">Python test-suite</a> against the RabbitMQ broker</li>
        </ul>
        <p></p>

        <div class="docSubsection">
            <a name="qpid-client" class="anchor" id="qpid-client"></a>
            <h3 class="docHeading"><a class="anchor" href="#qpid-client">Qpid clients » RabbitMQ broker </a></h3>
            <p>
                The 0.6 release of the Qpid java client was shipped with a bug that prevents it from correctly negotiating the protocol version. As it defaults to AMQP 0-10, it is unable to connect to any 0-8 or 0-9-1 broker (including
                RabbitMQ).
            </p>
            <p>A solution is to use git revision <span class="code">6f5d963</span>, committed shortly after the main release which fixes protocol negotiation.</p>
            <p>
                In order to run their examples, one must first configure the RabbitMQ broker with the necessary vhost (<span class="code">/test</span>) and permissions(<span class="code">.* .* .*</span>). This is most easily done through
                the management tools (<span class="code">rabbitmqctl</span>).
            </p>
            <p>
                Due to a disagreement regarding the spec, almost none of the examples will work. RabbitMQ declares the standard
                <span class="code">amq.*</span> exchanges as durable. Before using them, Qpid always re-declares them, and does so as non-durable. As a result, RabbitMQ will raise a precondition failed exception for most of the examples.
            </p>
            <p>
                As the <a href="#qpid-python-tests">tests</a> below show, the Python client interoperates with the RabbitMQ broker completely -- the only incompatibilities are in the interpretation of AMQP. A slight difficulty lies in that
                the Python client has different APIs for AMQP 0-8/0-9/0-9-1 and 0-10. In order to work with RabbitMQ, the former should be used.
            </p>
            <p>
                Both the Qpid Ruby client and the .NET client can connect to the RabbitMQ broker, but since both clients use 0-9-1 methods for 0-8 connections and since both clients default to 0-8, framing errors occur and the broker closes
                the connection. This problem might go away if the clients were somehow forced to use 0-9-1.
            </p>
        </div>

        <div class="docSubsection">
            <a name="qpid-server" class="anchor" id="qpid-server"></a>
            <h3 class="docHeading"><a class="anchor" href="#qpid-server">RabbitMQ clients » Qpid Java broker</a></h3>
            <p>
                Broadly speaking, the RabbitMQ clients can interoperate with Qpid. Exceptions to this rule are documented below.
            </p>
            <p>
                Some of the RabbitMQ Java client tests and examples use features that are not implemented (correctly) in Qpid.
            </p>
            <ul>
                <li>Qpid does not support the if-unused parameter of <span class="code">exchange.delete</span>.</li>
                <li>Qpid does not support auto-deleted and alternate exchanges.</li>
                <li>
                    Qpid misinterprets empty strings in the type field of passive <span class="code">exchange.declare</span> methods; it will raise an exception in these circumstances. As a result, the
                    <span class="code">exchangeDeclarePassive</span> methods in the RabbitMQ clients will not work.
                </li>
                <li>There are some differences in transaction semantics; Qpid is generally more lax and does not raise exceptions in certain circumstances.</li>
                <li>There are some minor differences in qos semantics.</li>
            </ul>
            <p>
                Furthermore, the Qpid Java broker does not accept
                <span class="code">"/"</span> for a virtual host. Since this is the default value for all RabbitMQ clients, care must be taken to specify a different one before attempting to connect to Qpid.
            </p>
            <p>
                The .NET and Erlang clients can connect to the Qpid broker. We have not done more in-depth testing.
            </p>
        </div>

        <div class="docSubsection">
            <a name="qpid-cpp-server" class="anchor" id="qpid-cpp-server"></a>
            <h3 class="docHeading"><a class="anchor" href="#qpid-cpp-server">Qpid C++ broker</a></h3>
            <p>
                The 0.6 Qpid C++ broker supports only AMQP 0-10; none of the RabbitMQ clients can connect to it.
            </p>
        </div>

        <div class="docSubsection">
            <a name="qpid-python-tests" class="anchor" id="qpid-python-tests"></a>
            <h3 class="docHeading"><a class="anchor" href="#qpid-python-tests">Test results from Qpid/Python Test Suite</a></h3>
            <p>
                The Qpid project maintains a Python test-suite that aims to be mostly broker independent. It can currently be found in the python/ directory of their source distribution. To run the test suite, execute the following command
                in the aforementioned directory:
            </p>
            <pre class="lang-bash hljs language-bash">python2.7 ./qpid-python-test -m tests_0-9 -m tests_0-8</pre>
            <p>
                The following table details the results of running the 0-8 and 0-9 tests against the RabbitMQ broker.
            </p>
            <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
                <tbody>
                    <tr>
                        <th>Current Status</th>
                        <th>Test Name</th>
                        <th>Notes</th>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_ack</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_cancel</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_consume_exclusive</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_planned">planned</td>
                        <td>tests_0-8.basic.BasicTests.test_consume_no_local</td>
                        <td>RabbitMQ does not support <span class="code">basic.consume&lcub;no-local}</span>.</td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-8.basic.BasicTests.test_consume_queue_errors</td>
                        <td>
                            Error codes changed for 0-9-1
                        </td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_consume_unique_consumers</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_get</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_qos_prefetch_count</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_planned">planned</td>
                        <td>tests_0-8.basic.BasicTests.test_qos_prefetch_size</td>
                        <td>RabbitMQ does not support <span class="code">basic.qos&lcub;prefetch-size}</span>.</td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.basic.BasicTests.test_recover_requeue</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.broker.BrokerTests.test_ack_and_no_ack</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_failing">failing</td>
                        <td>tests_0-8.broker.BrokerTests.test_basic_delivery_immediate</td>
                        <td>RabbitMQ does not support the <span class="code">basic.publish</span> 'immediate' flag.</td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.broker.BrokerTests.test_basic_delivery_queued</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.broker.BrokerTests.test_channel_flow</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.broker.BrokerTests.test_closed_channel</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.broker.BrokerTests.test_invalid_channel</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.example.ExampleTest.test_example</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.DeclareMethodOkiveFieldNotFoundRuleTests.test</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.DefaultExchangeRuleTests.testDefaultExchange</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.HeadersExchangeTests.testMatchAll</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.HeadersExchangeTests.testMatchAny</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-8.exchange.MiscellaneousErrorsTests.testDifferentDeclaredType</td>
                        <td>
                            Error codes changed for 0-9-1
                        </td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.MiscellaneousErrorsTests.testTypeNotKnown</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RecommendedTypesRuleTests.testDirect</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RecommendedTypesRuleTests.testFanout</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RecommendedTypesRuleTests.testHeaders</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RecommendedTypesRuleTests.testTopic</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RequiredInstancesRuleTests.testAmqDirect</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RequiredInstancesRuleTests.testAmqFanOut</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RequiredInstancesRuleTests.testAmqMatch</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.exchange.RequiredInstancesRuleTests.testAmqTopic</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_bind</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_declare_exclusive</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_declare_okive</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_delete_ifempty</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_delete_ifunused</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.queue.QueueTests.test_delete_simple</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-8.queue.QueueTests.test_purge</td>
                        <td>
                            Error codes changed for 0-9-1.
                        </td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.testlib.TestBaseTest.testAssertEmptyFailing</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.testlib.TestBaseTest.testAssertEmptyPass</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.testlib.TestBaseTest.testMessageProperties</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-8.tx.TxTests.test_rollback</td>
                        <td>
                            The test assumes that delivered messages are re-queued on rollback, which is in violation of the spec.
                        </td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-8.tx.TxTests.test_auto_rollback</td>
                        <td>
                            The test is actually the same as test_rollback and is therefore invalid for the same reason.
                        </td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.tx.TxTests.test_commit</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_ok">ok</td>
                        <td>tests_0-8.tx.TxTests.test_commit_overlapping_acks</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="statusCell status_invalid">invalid</td>
                        <td>tests_0-9.query.QueryTests.*</td>
                        <td>
                            Qpid specific extension.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="docSection">
        <a name="openamq" class="anchor" id="openamq"></a>
        <h2 class="docHeading"><a class="anchor" href="#openamq">Interoperation with OpenAMQ</a></h2>
        <div class="docSubsection">
            <a name="openamq-server" class="anchor" id="openamq-server"></a>
            <h3 class="docHeading"><a class="anchor" href="#openamq-server">OpenAMQ brokers</a></h3>
            <p>We have performed basic interoperability testing against the <a href="http://www.openamq.org/main:release-notes">OpenAMQ/1.3d0 and OpenAMQ/1.4c0 brokers</a>. We have run our Java client tests and examples against them.</p>
            <p>
                Unfortunately, we found that the OpenAMQ brokers do not implement (correctly) a large part of the AMQP specification. As a result, they fail a large number of our tests. More precisely, we found that OpenAMQ:
            </p>
            <ul>
                <li>does not support durable queues,</li>
                <li>does not support multiple channels per connection,</li>
                <li>does not encode <span class="code">queue.unbind</span> methods correctly,</li>
                <li>misinterprets the type field for exchange methods, and</li>
                <li>does not appear to support transactions</li>
            </ul>
            <p>
                Some of our examples, most notably MulticastMain, do work, so it is possible to do basic publish/consume. Note that the OpenAMQ brokers occasionally reset the connection without warning.
            </p>
        </div>
        <div class="docSubsection">
            <a name="palexamples" class="anchor" id="palexamples"></a>
            <h3 class="docHeading"><a class="anchor" href="#palexamples">OpenAMQ PAL Examples</a></h3>
            <p>
                The <a href="http://www.openamq.org">OpenAMQ</a> project has <a href="https://github.com/imatix/openamq-pal-examples">a small number</a> of <a href="http://www.openamq.org/doc:prog-pal">PAL scripts</a>
                designed to test AMQP brokers.
            </p>

            <p>These are short scripts that are compiled to C programs that use the OpenAMQ WireAPI. When running the examples, we found that it is useful to set the trace level to 1 (<span class="code">-t 1</span>).</p>

            <p>
                RabbitMQ passes most of the tests; the only incompatibilities we found are:
            </p>
            <ul>
                <li>In addition to <span class="code">amq.topic</span>, OpenAMQ implements an <span class="code">amq.regexp</span> exchange.</li>
                <li>OpenAMQ appears to add an extra 0 at the end of <span class="code">queue.unbind</span> methods. This breaks RabbitMQ's frame decoding and causes the broker to close the connection.</li>
                <li>RabbitMQ does not support the no-local parameter of <span class="code">basic.consume</span>.</li>
                <li>There are some slight disagreements as to what exception codes should be used in what situations.</li>
            </ul>
        </div>
    </div>

    <div class="docSection">
        <a name="versions" class="anchor" id="versions"></a>
        <h2 class="docHeading"><a class="anchor" href="#versions">RabbitMQ versions tested</a></h2>
        <p>
            The following versions of the RabbitMQ broker and clients were used when performing the tests:
        </p>
        <table>
            <tbody>
                <tr>
                    <td>RabbitMQ broker</td>
                    <td><span class="code">2.0.0</span></td>
                </tr>
                <tr>
                    <td>RabbitMQ Java Client</td>
                    <td><span class="code">2.0.0</span></td>
                </tr>
                <tr>
                    <td>RabbitMQ Erlang Client</td>
                    <td><span class="code">2.0.0</span></td>
                </tr>
                <tr>
                    <td>RabbitMQ .NET Client</td>
                    <td><span class="code">2.0.0</span></td>
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
