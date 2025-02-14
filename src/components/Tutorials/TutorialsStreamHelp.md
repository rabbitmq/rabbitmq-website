:::info
### Prerequisites

This tutorial assumes RabbitMQ is [installed](/docs/download), running on
`localhost` and the [stream plugin](/docs/stream#enabling-plugin)  enabled. 
The [standard stream port](/docs/networking#ports) is 5552. In case you
use a different host, port or credentials, connections settings would require
adjusting.

### Using docker

If you don't have RabbitMQ installed, you can run it in a Docker container:

```bash
docker run -it --rm --name rabbitmq -p 5552:5552 -p 15672:15672 -p 5672:5672  \
    -e RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS='-rabbitmq_stream advertised_host localhost' \
    rabbitmq:4-management
```
wait for the server to start and then enable the stream and stream management plugins:

```bash
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_stream rabbitmq_stream_management 
```

### Where to get help

If you're having trouble going through this tutorial you can contact us
through the [mailing
list](https://groups.google.com/forum/#!forum/rabbitmq-users) or [discord community server](https://www.rabbitmq.com/discord).
:::
