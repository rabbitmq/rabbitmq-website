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

But what if we need to hear the response from the worker?  Well,
that's a completely different story. This pattern is commonly known as
_Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build a RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

### Client interface

To illustrate how RPC could be exposed on the clients we're going to
create a simple client class. It's going to expose a method `call`
which sends a RPC request and blocks until the answer is received:

    :::python
    result = fibonacci_rpc.call(4)
    print "fib(4) is %i" % (result,)

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware
> if a function call is local or if it's a slow RPC call. Confusion
> like that can result in unpredictable system and adds unnecessary
> complexity to debugging. Instead of simplifying software misused RPC
> can effect in unmaintainable spaghetti code.
>
> Bearing that in mind consider the following advices:
>
>  * Make sure it's obvious which function call is local and which is remote.
>  * Document your system. Make the dependencies between components clear.
>  * Handle error cases. How the client should react when RPC server is down?
>
> When in doubt avoid RPC. If you can, you should use an asynchronous pipeline - 
> where instead of RPC-like blocking, the results are asynchronously pushed to a next
> computation stage.


### Callback queue

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message.

In order to receive a response we need to send a 'callback' queue
address with the request, let's try it:

    :::python
    result = channel.queue_declare(auto_delete=True)
    callback_queue = result.queue

    channel.basic_publish(exchange='',
                          routing_key='rpc_queue',
                          properties=pika.BasicProperties(
                                reply_to = callback_queue,
                                ),
                          body=request)

At that point our RPC client could just wait for the response message
on the `callback_queue`.

> #### Message properties and headers
>
> The AMQP protocol predefine a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `content_type`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practise
>    to set this header to: `application/json`.
> * `delivery_mode`: When the value is 2, a message is marked as persistent.
> * `reply_to`: Commonly used to name a callback queue.
> * `correlation_id`: Useful to correlate RPC responses with requests.
>
> The other useful property is `headers`. As a value of that property
> you can put any dictionary, which makes it very useful to handle
> any custom headers.


### Correlation id

In the method presented above we suggest creating a callback queue for
every RPC call. That's pretty inefficient, but fortunately it's easy
to improve - let's create a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request this response belongs. That's when the
`correlation_id` property is used. We're going to set it to a random
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to math a response with a request. If we see an unknown
`correlation_id` value, we may safely discard the message - it
doesn't belong to any of our requests.

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

  * When the Client starts up, it creates an anonymous auto-delete
    callback queue.
  * For a RPC request, the Client sends a message with two properties:
    `reply_to` which is set to the callback queue and `correlation_id`
    which is set to a random value for every request.
  * The request is send to an `rpc_queue` queue.
  * RPC worker (aka: server) is waiting for requests on that queue.
    When request appears, it does the job and sends a message with the
    result back to the Client, using the queue from `reply_to` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlation_id` property. If it matches
    the the value from the request it returns the response to the
    application.

Putting it all together
-----------------------


The code for our RPC server looks like that: 

    #!/usr/bin/env python
    import pika

    connection = pika.AsyncoreConnection(pika.ConnectionParameters(
            host='127.0.0.1',
            credentials=pika.PlainCredentials('guest', 'guest')))
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

  * (4) As usual we start with connection establishment and queue declaration.
  * (11) Next, we declare our recursive fibonacci-counting
    function. Don't expect it to work for big numbers, it's probably
    the slowest implementation possible.
  * (19) At this point we're ready to declare the `basic_consume`
    callback, the core of the RPC server. It's executed when the request
    is received. It does the work and sends the response back.
  * (32) We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set
    `prefetch_count` setting.


The code for our RPC client:

    #!/usr/bin/env python
    import pika
    import uuid

    class FibonacciClient(object):
        def __init__(self):
            self.connection = pika.AsyncoreConnection(pika.ConnectionParameters(
                    host='127.0.0.1',
                    credentials=pika.PlainCredentials('guest', 'guest')))
            self.channel = self.connection.channel()

            result = self.channel.queue_declare(auto_delete=True)
            self.callback_queue = result.queue

            self.requests = {}
            self.channel.basic_consume(self.on_response, no_ack=True,
                                       queue=self.callback_queue)

        def on_response(self, ch, method, props, body):
            corr_id = props.correlation_id
            if corr_id in self.requests:
                self.requests[corr_id] = body

        def call(self, n):
            corr_id = str(uuid.uuid4())
            self.requests[corr_id] = None
            self.channel.basic_publish(exchange='',
                                       routing_key='rpc_queue',
                                       properties=pika.BasicProperties(
                                             reply_to = self.callback_queue,
                                             correlation_id = corr_id,
                                             ),
                                       body=str(n))
            while self.requests[corr_id] is None:
                pika.asyncore_loop(count=1)
            response = self.requests[corr_id]
            del self.requests[corr_id]
            return int(response)


    fibonacci_rpc = FibonacciClient()

    print " [x] Requesting fib(30)"
    response = fibonacci_rpc.call(30)
    print " [.] Got %r" % (response,)


The client code is slightly more involved:

  * (7) We start with connection establishment and a declaration of an
    autodelete 'callback' queue.
  * (15) Straight on we subscribe to the 'callback' queue.
  * (19) The callback executed on every response is doing very simple
    job, for every response message if the `correlation_id` is known,
    it saves the response in 'requests' dictionary.
  * (24) Next, we define our main `call` method.
  * (25) In this method, first we generate an unique `correlation_id`
    number and save it in the 'requests' dictionary.
  * (27) Next, we publish the request message, with two properties:
    `reply_to` and `correlation_id`.
  * (34) At this point we should just wait until the proper response
    message appears.
  * (36) And finally when we received the response, we need to clean
    up the 'requests' dictionary and return the response to the user.


Our RPC service is now ready. We should start the server first:

    $ python rpc_server.py
     [x] Awaiting RPC requests

To request a fibonacci number run the client:

    $ python rpc_client.py 
     [x] Requesting fib(30)

The presented design is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running second `rpc_server.py` in a new console.
 * On the client side, the RPC call requires sending one message and
   receiving one message. No synchronous calls like `queue_declare`
   are required. This leads to a significant performance boost against
   naive implementations.

But our code is still pretty simplistic and doesn't try to solve more
complex problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC call?
 * When the server malfunctions and raises an exception, should it be
   forwarded to the client?

(Full source code for [rpc_client.py](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/rpc_client.py) and [rpc_server.py](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/rpc_server.py))

</div>
