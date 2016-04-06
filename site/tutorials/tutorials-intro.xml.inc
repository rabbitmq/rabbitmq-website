<?xml version="1.0" encoding="utf-8" ?>
<div>
<p>RabbitMQ is a message broker. The principal idea is pretty simple: it accepts
and forwards messages. You can think about it as a post office: when you send
mail to the post box you're pretty sure that Mr. Postman will eventually
deliver the mail to your recipient. Using this metaphor RabbitMQ is a post box,
a post office and a postman.</p>
<p>The major difference between RabbitMQ and the post office is the fact that it
doesn't deal with paper, instead it accepts, stores and forwards binary
blobs of data ‒ <em>messages</em>.</p>
<p>RabbitMQ, and messaging in general, uses some jargon.</p>
<ul>
<li>
<p><em>Producing</em> means nothing more than sending. A program that sends messages
is a <em>producer</em>. We'll draw it like that, with "P":
<div class="diagram">
 <img src="/img/tutorials/producer.png" height="50" />
 <div class="diagram_source">
 digraph {
   bgcolor=transparent;
   truecolor=true;
   rankdir=LR;
   node [style="filled"];
   //
   P1 [label="P", fillcolor="#00ffff"];
 }
 </div>
</div></p>
</li>
<li>
<p><em>A queue</em> is the name for a mailbox. It lives inside
RabbitMQ. Although messages flow through RabbitMQ and your
applications, they can be stored only inside a <em>queue</em>. A <em>queue</em>
is not bound by any limits, it can store as many messages as you
like ‒ it's essentially an infinite buffer. Many <em>producers</em> can send
messages that go to one queue, many <em>consumers</em> can try to
receive data from one <em>queue</em>. A queue will be drawn as like that, with
its name above it:
<div class="diagram">
 <img src="/img/tutorials/queue.png" height="90" />
 <div class="diagram_source">
 digraph {
   bgcolor=transparent;
   truecolor=true;
   rankdir=LR;
   node [style="filled"];
   //
   subgraph cluster_Q1 {
     label="queue_name";
     color=transparent;
     Q1 [label="{||||}", fillcolor="red", shape="record"];
   };
 }
 </div>
</div></p>
</li>
<li>
<p><em>Consuming</em> has a similar meaning to receiving. A <em>consumer</em> is a program
that mostly waits to receive messages. On our drawings it's shown with "C":
<div class="diagram">
 <img src="/img/tutorials/consumer.png" height="50" />
 <div class="diagram_source">
 digraph {
   bgcolor=transparent;
   truecolor=true;
   rankdir=LR;
   node [style="filled"];
   //
   C1 [label="C", fillcolor="#33ccff"];
 }
 </div>
</div></p>
</li>
</ul>
<p>Note that the producer, consumer, and broker do not have to reside on
the same machine; indeed in most applications they don't.</p>
</div>
