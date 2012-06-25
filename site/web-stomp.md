# RabbitMQ Web-Stomp Plugin NOSYNTAX

The Web-Stomp plugin is a simple bridge exposing RabbitMQ
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
JavaScript object in any browser. It will in older browsers that don't
have native WebSocket support, as well as in new browsers that are
behind WebSocket-unfriendly proxies.


## <a id="iws"/>Installing Web-Stomp

The Web-Stomp plugin is not yet included in the RabbitMQ distribution.
To use it you will need to have
[RabbitMQ server](http://www.rabbitmq.com/download.html) installed.

Once you have RabbitMQ-server installed, download the plugins required
by Web-Stomp:

    wget \
      http://www.rabbitmq.com/releases/plugins/v2.8.2-web-stomp-preview/cowboy-0.5.0-rmq2.8.2-git4b93c2d.ez \
      http://www.rabbitmq.com/releases/plugins/v2.8.2-web-stomp-preview/sockjs-0.2.1-rmq2.8.2-gitfa1db96.ez \
      http://www.rabbitmq.com/releases/plugins/v2.8.2-web-stomp-preview/rabbitmq_web_stomp-2.8.2.ez \
      http://www.rabbitmq.com/releases/plugins/v2.8.2-web-stomp-preview/rabbitmq_web_stomp_examples-2.8.2.ez

Next, copy them to
[the plugins directory](http://www.rabbitmq.com/plugins.html#installing-plugins). For
example, on Ubuntu this will be:

    sudo cp *.ez /usr/lib/rabbitmq/lib/rabbitmq_server-2.8.2/plugins

Finally, to enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_web_stomp

To apply the changes you need to restart the RabbitMQ broker.

Instructions for installing binary plugins can also be found in the
[plugins page](/plugins.html#installing-plugins).


## <a id="usage"/>Usage

In order to use STOMP in a web-browser context, a JavaScript STOMP
library is required. We've tested a
[stomp-websocket](https://github.com/jmesnil/stomp-websocket/) library
by [Jeff Mesnil](https://github.com/jmesnil) and
[Jeff Lindsay](https://github.com/progrium). A [slightly modified
version](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/priv/stomp.js)
of this library is provided as part of RabbitMQ-Web-Stomp-Examples.

By default the Web-Stomp plugin exposes a SockJS endpoint on port
55674 with `/stomp` prefix:

    http://127.0.0.1:55674/stomp

In order to establish connection from the browser using SockJS you may
use code like that:

    <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
    <script src="stomp.js"></script>
    <script>
        WebSocketStompMock = SockJS;

        var client = Stomp.client('http://127.0.0.1:55674/stomp');
        [...]

Alternatively, you may skip the SockJS layer and use
native WebSockets as provided by the browser. SockJS provides a
pure [RFC 6455](http://www.rfc-editor.org/rfc/rfc6455.txt) endpoint url:

    ws://127.0.0.1:55674/stomp/websocket
    
To use it:


    <script src="stomp.js"></script>
    <script>
        var client = Stomp.client('ws://127.0.0.1:55674/stomp/websocket');
        [...]


## <a id="examples"/>Examples (RabbitMQ-Web-Stomp-Examples)

Few simple Web-Stomp examples are provided as a
[RabbitMQ-Web-Stomp-Examples](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/)
plugin. To get it running follow the installation instructions above
and enable the plugin:

    rabbitmq-plugins enable rabbitmq_web_stomp_examples

To apply the changes you need to restart the RabbitMQ broker.

The examples will be available under
[http://127.0.0.1:55670/](http://127.0.0.1:55670/) url. You will see two examples:

 * "echo" - shows how to use STOMP to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage to take a look [at the source code](http://hg.rabbitmq.com/rabbitmq-web-stomp-examples/file/default/priv).

## <a id="config"/>Configuration

When no configuration is specified the Web-Stomp plugin will listen on
all interfaces on port 55674 and have a default user login/passcode of
`guest`/`guest`.

To change this, edit your
[Configuration file](/configure.html#configuration-file),
to contain a `port` variable for the `rabbitmq_web_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

    [
      {rabbitmq_web_stomp, [{port, 12345}]}
    ].


## <a id="missing"/>Missing features

RabbitMQ-Web-Stomp is fully compatible with the
[RabbitMQ-STOMP](/stomp.html) plugin, with the exception of STOMP
heartbeats. STOMP heartbeats won't work with Web-Stomp plugin.
