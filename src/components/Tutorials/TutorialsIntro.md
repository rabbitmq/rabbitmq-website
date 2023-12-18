RabbitMQ is a message broker: it accepts and forwards messages. You can think
about it as a post office: when you put the mail that you want posting in a
post box, you can be sure that the letter carrier will eventually deliver the
mail to your recipient. In this analogy, RabbitMQ is a post box, a post
office, and a letter carrier.

The major difference between RabbitMQ and the post office is that it doesn't
deal with paper, instead it accepts, stores, and forwards binary blobs of data
‒ *messages*.

RabbitMQ, and messaging in general, uses some jargon.

* *Producing* means nothing more than sending. A program that sends messages
  is a *producer* :

    ```mermaid
    flowchart LR
        P((P))
        class P mermaid-producer
    ```

* *A queue* is the name for the post box in RabbitMQ. Although messages flow
  through RabbitMQ and your applications, they can only be stored inside a
  *queue*. A *queue* is only bound by the host's memory & disk limits, it's
  essentially a large message buffer.

  Many *producers* can send messages that go to one queue, and many
  *consumers* can try to receive data from one *queue*.

  This is how we represent a queue:

    ```mermaid
    flowchart LR
        Q[[queue_name]]
        class Q mermaid-queue
    ```

* *Consuming* has a similar meaning to receiving. A *consumer* is a program
  that mostly waits to receive messages:

    ```mermaid
    flowchart LR
        C((C))
        class C mermaid-consumer
    ```

Note that the producer, consumer, and broker do not have to reside on the same
host; indeed in most applications they don't. An application can be both a
producer and consumer, too.
