# RabbitMQ tutorial - Remote procedure call (RPC)

<div id="sidebar" class="tutorial-six">
   <xi:include href="tutorials-menu.xml.inc"/>
</div>

<div id="tutorial">

## Remote procedure call (RPC)

<xi:include href="tutorials-help.xml.inc"/>


In the [second tutorial](/tutorial-two-python.html) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build a RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

### Client interface

To illustrate how RPC service could be used we're going to
create a simple client class. It's going to expose a method `call`
which sends a RPC request and blocks until the answer is received:

    :::python
    fibonacci_rpc = FibonacciRpcClient()
    result = fibonacci_rpc.call(4)
    print "fib(4) is %r" % (result,)

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware
> whether a function call is local or if it's a slow RPC call. Confusions
> like that result in an unpredictable system and adds unnecessary
> complexity to debugging. Instead of simplifying software, misused RPC
> can result in unmaintainable spaghetti code.
>
> Bearing that in mind, consider the following advice:
>
>  * Make sure it's obvious which function call is local and which is remote.
>  * Document your system. Make the dependencies between components clear.
>  * Handle error cases. How should the client react when the RPC server is
>    down for a long time?
>
> When in doubt avoid RPC. If you can, you should use an asynchronous
> pipeline - instead of RPC-like blocking, results are asynchronously
> pushed to a next computation stage.


### Callback queue

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message. In order to
receive a response we need to send a 'callback' queue address with the
request. Let's try it:

    :::python
    result = channel.queue_declare(exclusive=True)
    callback_queue = result.queue

    channel.basic_publish(exchange='',
                          routing_key='rpc_queue',
                          properties=pika.BasicProperties(
                                reply_to = callback_queue,
                                ),
                          body=request)

    # ... here goes the code to read a response message from the callback_queue ...


> #### Message properties and headers
>
> The AMQP protocol predefine a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `delivery_mode`: Marks a message is as persistent (value of `2`)
>    or transient (any other value). You may remember this property
>    from [the second tutorial](/tutorial-two-python.html).
> * `content_type`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this header to: `application/json`.
> * `reply_to`: Commonly used to name a callback queue.
> * `correlation_id`: Useful to correlate RPC responses with requests.


### Correlation id

In the method presented above we suggest creating a callback queue for
every RPC call. That's pretty inefficient, but fortunately there is
a better way - let's create a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`correlation_id` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`correlation_id` value, we may safely discard the message - it
doesn't belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC calls should ideally be idempotent.

### Summary

<div class="diagram">
  <img src="/img/tutorials/python-six.png" height="200" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      subgraph cluster_C {
        label="Client";
	color=transparent;
        C [label="C", fillcolor="#00ffff"];
      };
      subgraph cluster_XXXa {
	color=transparent;
      subgraph cluster_Note {
	color=transparent;
        N [label="Request\nreply_to=amqp.gen-Xa2...\ncorrelation_id=abc",
	   fontsize=12,
	   shape=note];
      };
      subgraph cluster_Reply {
	color=transparent;
        R [label="Reply\ncorrelation_id=abc",
	   fontsize=12,
	   shape=note];
      };
      };
      subgraph cluster_XXXb {
	color=transparent;
      subgraph cluster_RPC {
        label="rpc_queue";
	color=transparent;
        RPC [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      subgraph cluster_REPLY {
        label="reply_to=amq.gen-Xa2...";
	color=transparent;
        REPLY [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      };
      subgraph cluster_W {
        label="Server";
	color=transparent;
        W [label="S", fillcolor="#00ffff"];
      };
      //
      C -&gt; N;
      N -&gt; RPC:s;
      RPC:e -&gt; W;
      W -&gt; REPLY:e;
      REPLY:s -&gt; R;
      R -&gt; C;
    }
  </div>
</div>

Our RPC will work like that:

  * When the Client starts up, it creates an anonymous exclusive
    callback queue.
  * For a RPC request, the Client sends a message with two properties:
    `reply_to` which is set to the callback queue and `correlation_id`
    which is set to a unique value for every request.
  * The request is send to an `rpc_queue` queue.
  * RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `reply_to` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlation_id` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------


The code for our RPC server looks like this:

    #!/usr/bin/env python
    import pika

    connection = pika.AsyncoreConnection(pika.ConnectionParameters(
            host='localhost'))

    channel = connection.channel()

    channel.queue_declare(queue='rpc_queue')


    def fib(n):
        if n == 0:
            return 0
        elif n == 1:
            return 1
        else:
            return fib(n-1) + fib(n-2)

    def on_request(ch, method, props, body):
        n = int(body)

        print " [.] fib(%s)"  % (n,)
        response = fib(n)

        ch.basic_publish(exchange='',
                         routing_key=props.reply_to,
                         properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                         body=str(response))
        ch.basic_ack(delivery_tag = method.delivery_tag)


    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(on_request, queue='rpc_queue')

    print " [x] Awaiting RPC requests"
    pika.asyncore_loop()


The server code is rather straightforward:

  * (4) As usual we start by establishing the connection and declaring
    the queue.
  * (11) Next, we declare our fibonacci function. (Don't expect this one to
     work for big numbers, it's probably the slowest recursive implementation
     possible).
  * (19) At this point we're ready to declare the `basic_consume`
    callback, the core of the RPC server. It's executed when the request
    is received. It does the work and sends the response back.
  * (32) We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetch_count` setting.


The code for our RPC client:

    #!/usr/bin/env python
    import pika
    import uuid

    class FibonacciClient(object):
        def __init__(self):
            self.connection = pika.AsyncoreConnection(pika.ConnectionParameters(
                    host='localhost'))

            self.channel = self.connection.channel()

            result = self.channel.queue_declare(exclusive=True)
            self.callback_queue = result.queue

            self.corr_id = None
            self.channel.basic_consume(self.on_response, no_ack=True,
                                       queue=self.callback_queue)

        def on_response(self, ch, method, props, body):
            if props.correlation_id == self.corr_id:
                self.response = body

        def call(self, n):
            self.corr_id = str(uuid.uuid4())
            self.response = None
            self.channel.basic_publish(exchange='',
                                       routing_key='rpc_queue',
                                       properties=pika.BasicProperties(
                                             reply_to = self.callback_queue,
                                             correlation_id = self.corr_id,
                                             ),
                                       body=str(n))
            while self.response is None:
                pika.asyncore_loop(count=1)
            return self.response


    fibonacci_rpc = FibonacciClient()

    print " [x] Requesting fib(30)"
    response = fibonacci_rpc.call(30)
    print " [.] Got %r" % (response,)


The client code is slightly more involved:

  * (7) We start with connection establishment and a declaration of an
    exclusive 'callback' queue.
  * (15) Next we subscribe to the 'callback' queue, so that
    we can receive RPC responses.
  * (19) The callback executed on every response is doing very simple
    job, for every response message if the `correlation_id` is the one
    we're looking for. If so, it saves the response in `self.response`.
  * (23) Next, we define our main `call` method - it does the actual
    RPC request.
  * (24) In this method, first we generate an unique `correlation_id`
    number and save it - the 'on_response' callback function will
    use this value to catch the appropriate response.
  * (26) Next, we publish the request message, with two properties:
    `reply_to` and `correlation_id`.
  * (33) At this point we can sit back and wait until the proper
    response arrives.
  * (35) And finally we return the response back to the user.

Our RPC service is now ready. We can start the server:

    $ python rpc_server.py
     [x] Awaiting RPC requests

To request a fibonacci number run the client:

    $ python rpc_client.py
     [x] Requesting fib(30)

The presented design is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running second `rpc_server.py` in a new console.
 * On the client side, the RPC call requires sending and
   receiving only one message. No synchronous calls like `queue_declare`
   are required. As a result the RPC client needs only one network
   roundtrip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC call?
 * When the server malfunctions and raises an exception, should it be
   forwarded to the client?

(Full source code for [rpc_client.py](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/rpc_client.py) and [rpc_server.py](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/rpc_server.py))

</div>
