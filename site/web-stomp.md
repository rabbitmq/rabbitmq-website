# RabbitMQ Web-Stomp Plugin NOSYNTAX

The Web-Stomp plugin is a simple bridge exposing the
[STOMP](http://stomp.github.com) protocol over emulated
[HTML5 WebSockets](https://en.wikipedia.org/wiki/WebSockets).

The main intention of Web-Stomp is to make it possible to use RabbitMQ
from web browsers.

More context is available in
[the introductory blog post](http://www.rabbitmq.com/blog/2012/05/14/introducing-rabbitmq-web-stomp/).

## <a id="rationale"/>What it actually does

RabbitMQ Web-Stomp plugin is rather simple. It takes the STOMP protocol,
as provided by [RabbitMQ-STOMP plugin](/stomp.html) and exposes it using
[a SockJS server](http://sockjs.org).

SockJS is a WebSockets poly-fill that provides a WebSocket-like
JavaScript object in any browser. It will therefore work in older
browsers that don't have native WebSocket support, as well as in new
browsers that are behind WebSocket-unfriendly proxies.


## <a id="iws"/>Installing Web-Stomp
To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_web_stomp

To apply the changes you need to restart the RabbitMQ broker.

## <a id="usage"/>Usage

In order to use STOMP in a web-browser context, a JavaScript STOMP
library is required. We've tested a
[stomp-websocket](https://github.com/jmesnil/stomp-websocket/) library
by [Jeff Mesnil](https://github.com/jmesnil) and
[Jeff Lindsay](https://github.com/progrium).
[This library](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/priv/stomp.js)
is included as part of RabbitMQ-Web-Stomp-Examples.

By default the Web-Stomp plugin exposes a SockJS endpoint on port
15674 with `/stomp` prefix:

    http://127.0.0.1:15674/stomp

In order to establish connection from the browser you may
use code like:

    <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
    <script src="stomp.js"></script>
    <script>

        var ws = new SockJS('http://127.0.0.1:15674/stomp');
        var client = Stomp.over(ws);
        [...]

Once you have the `client` object you can follow API's exposed by
stomp.js library. The next step is usually to establish a STOMP
connection with the broker:

        [...]
        var on_connect = function() {
            console.log('connected');
        };
        var on_error =  function() {
            console.log('error');
        };
        client.connect('guest', 'guest', on_connect, on_error, '/');
        [...]


## <a id="examples"/>Examples (RabbitMQ-Web-Stomp-Examples)

A few simple Web-Stomp examples are provided as a
[RabbitMQ-Web-Stomp-Examples](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/)
plugin. To get it running follow the installation instructions above
and enable the plugin:

    rabbitmq-plugins enable rabbitmq_web_stomp_examples

To apply the changes you need to restart the RabbitMQ broker.

The examples will be available under
[http://127.0.0.1:15670/](http://127.0.0.1:15670/) url. You will see two examples:

 * "echo" - shows how to use STOMP to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage you to take a look [at the source code](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/priv).

## <a id="config"/>Configuration

When no configuration is specified the Web-Stomp plugin will listen on
all interfaces on port 15674 and have a default user login/passcode of
`guest`/`guest`.

To change this, edit your
[Configuration file](/configure.html#configuration-file),
to contain a `port` variable for the `rabbitmq_web_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

    [
      {rabbitmq_web_stomp, [{port, 12345}]}
    ].

In addition, encrypted connections are supported if SSL configuration parameters are
provided in the `ssl_config` section:

    [
      {rabbitmq_web_stomp,
          [{ssl_config, [{port,       15671},
                         {backlog,    1024},
                         {certfile,   "path/to/certs/client/cert.pem"},
                         {keyfile,    "path/to/certs/client/key.pem"},
                         {cacertfile, "path/to/certs/testca/cacert.pem"},
                         {password,   "changeme"}]}]}
    ].

See the [webserver documentation](https://github.com/rabbitmq/cowboy/blob/4b93c2d19a10e5d9cee207038103bb83f1ab9436/src/cowboy_ssl_transport.erl#L40)
for details about accepted parameters.

## <a id="missing"/>Missing features

RabbitMQ-Web-Stomp is fully compatible with the
[RabbitMQ-STOMP](/stomp.html) plugin, with the exception of STOMP
heartbeats. STOMP heartbeats won't work with SockJS.
