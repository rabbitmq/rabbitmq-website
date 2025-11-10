---
title: Direct Reply-To
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Direct Reply-To

## Overview

Direct Reply-To lets you implement RPC (request/reply) patterns like those in [tutorial 6](/tutorials#6-rpc) without creating a dedicated reply [queue](./queues).

## Motivation

RPC (request/reply) is a common pattern with brokers such as RabbitMQ.
[Tutorial 6](/tutorials#6-rpc) shows several client implementations. Typically, the requester (RPC client) sends requests that are routed to a long-lived, known request queue. The responder (RPC server) consumes from that queue and sends replies using the queue name supplied in the request message’s `reply-to` property.

Where does the requester’s reply queue come from?
A requester could declare a single-use queue for each request–reply pair, but that’s inefficient: even an unreplicated queue is relatively expensive to create and delete compared to the cost of receiving a reply.
In clusters the overhead is higher because all nodes must agree on creation, type, replication parameters, and other metadata.

A better approach is to create a single reply queue per requester and reuse it across requests.
The [properties](queues#properties) of that queue depend on the use case:
* [Exclusive](queues#exclusive-queues) queues are common when a single client consumes replies and the queue is deleted on disconnect.
* Non-exclusive, long-lived queues suit long-running tasks where replies should survive brief client disconnects.

**Direct Reply-To** is a RabbitMQ-specific alternative that completely **eliminates the reply queue**. That means:
* No queue metadata are written to the [metadata store](./metadata-store) (Khepri).
* No queue buffers or persists reply messages.
* No separate Erlang process exists for the reply queue.

Main benefits:
* Less load on the [metadata store](./metadata-store) (no insert/delete of queue metadata).
* Less load on the [Management HTTP API](./management#http-api): fewer queues to list in the [Management UI](./management#external-monitoring) and fewer metrics to emit.
* Fewer Erlang processes on the broker.

With Direct Reply-To, on the broker side, the responder’s AMQP 1.0 [session](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-sessions) or AMQP 0.9.1 [channel](./channels) process delivers the reply directly to the requester’s session/channel process without going through an actual queue.

“Directly” still means via the broker; there is no point-to-point network connection between the two client applications.

## When to Use Direct Reply-To {#when-to-use}

The main use case is scale: many (tens of thousands of) clients performing request/reply.

While clients should prefer long-lived connections, Direct Reply-To also works well with [high connection churn](connections#high-connection-churn), where a client connects for a single RPC and disconnects immediately afterward. Avoiding queue create/delete reduces overhead and latency.

Since Direct Reply-To has **at-most-once** delivery semantics for replies, use it only when losing a reply is acceptable. For example, if a reply isn’t received within a timeout, the requester is expected to resend the request.

## When to Avoid Direct Reply-To {#when-to-avoid}

Avoid Direct Reply-To if any of the following apply:
* You require **at-least-once** guarantees for replies (i.e., losing a reply is unacceptable).
* Replies must be durably buffered by the broker.
* You need high throughput to the same requester (e.g., hundreds+ of messages per second). Queues exist to buffer when a consumer can’t keep up.

For workloads with long-lived connections and multiple RPCs, the benefits of Direct Reply-To are smaller relative to using [classic queues](classic-queues).
Modern RabbitMQ versions optimize classic queues for low latency and low resource usage, so they can be similarly efficient in these scenarios.
Conventional request-reply using explicitly declared classic queues is equally valid and can be preferable for long-running tasks.

## Broker Implementation Details

Internally, RabbitMQ implements Direct Reply-To using the `rabbit_volatile_queue` queue type.
“Volatile” describes the semantics: non-durable, zero-buffer, at-most-once, may drop, and not stored in the metadata store.

You will see `rabbit_volatile_queue` only in a few places. Instances do not appear in the Management UI or in `rabbitmqctl list_queues`.

One place is in [Prometheus](./prometheus) metrics, for example:
* `rabbitmq_global_messages_delivered_total{protocol="amqp10",queue_type="rabbit_volatile_queue"}`
  Number of messages (“direct replies”) delivered to AMQP 1.0 requesters.
* `rabbitmq_global_messages_delivered_total{protocol="amqp091",queue_type="rabbit_volatile_queue"}`
  Number of messages (“direct replies”) delivered to AMQP 0.9.1 requesters.
* `rabbitmq_global_messages_dead_lettered_maxlen_total{queue_type="rabbit_volatile_queue",dead_letter_strategy="disabled"}`
  Number of messages (“direct replies”) dropped by RabbitMQ.

## Usage

Direct Reply-To is supported for AMQP 1.0 and AMQP 0.9.1.
It also works across protocols (e.g., AMQP 1.0 requester with AMQP 0.9.1 responder, or vice versa).

### Usage in AMQP 1.0 {#usage-amqp}

The requester first attaches a link to receive reply messages.
The [attach](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-attach) (with a [source](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source)) must set specific fields.
If your [AMQP 1.0 client library](/client-libraries/amqp-client-libraries) supports Direct Reply-To, it will set them for you (see [examples](#examples-amqp)).
Otherwise:
* Set `snd-settle-mode` to `settled` since RabbitMQ sends all replies settled.
  There is no queue to return a reply to if the requester disconnects or rejects it.
* Leave `address` unset; RabbitMQ will generate the address.
* Leave `durable` unset or set it to `none`; no state is kept in the RabbitMQ metadata store.
* Set `expiry-policy` to `link-detach`.
* Leave `timeout` unset or set it to `0`.
* Include `rabbitmq:volatile-queue` in `capabilities`.

RabbitMQ returns a broker-generated pseudo-queue address in the `address` field of the `attach` response.
It looks like `/queues/amq.rabbitmq.reply-to.<opaque-suffix>`, where `<opaque-suffix>` is not meaningful to clients.

Before sending the first request, the requester must grant link credit to this pseudo-queue.

For each request, set the following message [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties):
1. `message-id`: a globally unique value. (The responder will set the reply’s `correlation-id` to this value.)
2. `reply-to`: the address received in the `attach` response.

The responder reads the request’s `reply-to` and sends the reply to that address via one of two options:
1. Attach a sending link to the anonymous terminus (null target address) as described in [Target Address v2](./amqp#target-address-v2), and set the reply address in the message’s `to` property.
   Useful when replying to many different requesters (no per-requester link).
2. Create a sending link directly to the provided address.
   In this case, RabbitMQ checks whether the requester is still connected; if not, RabbitMQ refuses the link.

If the responder will perform expensive work, it can proactively check whether the requester is still present by issuing an HTTP GET over AMQP. A `200` status indicates the requester is still connected (see [examples](#examples-amqp)).

#### AMQP 1.0 Caveats and Limitations {#caveats-amqp}

* The requester must receive replies settled.
  There is no queue to return a reply if the requester disconnects or rejects it.
* The requester can receive replies only on the same connection and session where it attached its receiving link.
  Consumption from this pseudo-queue on another session is not supported.
* The responder should send replies settled.
  If it sends replies unsettled, RabbitMQ immediately settles them with the [accepted](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-accepted) outcome, even if the reply may subsequently be dropped.
* Replies sent via Direct Reply-To are not fault-tolerant.
  Because this pseudo-queue does not buffer, RabbitMQ drops replies when:
  * The AMQP 1.0 requester runs out of link credit.
    It’s the requester’s responsibility to grant sufficient link credit.
  * AMQP 1.0 [session flow control](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#doc-session-flow-control) disallows delivery.
    The requester must keep its `incoming-window` large enough.
  * The broker’s AMQP 1.0 writer process cannot send replies fast enough to the requester.

If message loss is unacceptable, use [classic queues](classic-queues) instead of Direct Reply-To.

#### Examples: AMQP 1.0 {#examples-amqp}

<Tabs groupId="languages">
<TabItem value="Java" label="Java">
```java
String requestQueue = "request-queue";

// create the responder
Responder responder = connection.responderBuilder()
    .requestQueue(requestQueue)
    .handler((ctx, req) -> {
        // check whether the requester is still connected (optional)
        if (ctx.isRequesterAlive(req)) {
            String in = new String(req.body(), UTF_8);
            String out = "*** " + in + " ***";
            return ctx.message(out.getBytes(UTF_8));
        } else {
            return null;
        }
    }).build();

// create the requester, it uses direct reply-to by default
Requester requester = connection.requesterBuilder()
    .requestAddress().queue(requestQueue)
    .requester()
    .build();

// create the request message
Message request = requester.message("hello".getBytes(UTF_8));
// send the request
CompletableFuture<Message> responseFuture = requester.publish(request);
// wait for the response
Message response = responseFuture.get(10, TimeUnit.SECONDS);
```
</TabItem>
<TabItem value="C#" label="C#">
A complete example is available in the [RabbitMQ Amqp1.0 .NET Client repo](
https://github.com/rabbitmq/rabbitmq-amqp-dotnet-client/tree/main/docs/Examples/Rpc)
```csharp
const string requestQueue = "amqp10.net-request-queue";

// create the responder
IResponder responder = await connection.ResponderBuilder().
    RequestQueue(requestQueue).Handler(
    (context, message) =>
    {
        // "message" parameter is the incoming message
        Trace.WriteLine(TraceLevel.Information, $"[Responder] Message received: {message.BodyAsString()} ");
    
        // create a reply message
        IMessage reply = context.Message("reply message");
        return Task.FromResult(reply);
     
    }
).BuildAsync();

// create the requester, it uses direct reply-to by default
IRequester requester = await connection.RequesterBuilder().RequestAddress().
        Queue(requestQueue).Requester().BuildAsync();

IMessage response = await requester.PublishAsync(
            new AmqpMessage("Hello"));
Trace.WriteLine(TraceLevel.Information, $"[Requester] Response received: {response.BodyAsString()}");
       
```

</TabItem>

<TabItem value="Erlang" label="Erlang">
```erlang
%% 1. Requester attaches its receiving link.
OpnConfRequester = OpnConfRequester0#{notify_with_performative => true},
{ok, ConnRequester} = amqp10_client:open_connection(OpnConfRequester),
{ok, SessionRequester} = amqp10_client:begin_session_sync(ConnRequester),
Source = #{address => undefined,
           durable => none,
           expiry_policy => <<"link-detach">>,
           dynamic => true,
           capabilities => [<<"rabbitmq:volatile-queue">>]},
AttachArgs = #{name => <<"receiver requester">>,
               role => {receiver, Source, self()},
               snd_settle_mode => settled,
               rcv_settle_mode => first},
{ok, ReceiverRequester} = amqp10_client:attach_link(SessionRequester, AttachArgs),

%% Requester learns the broker-generated reply address.
Addr = receive {amqp10_event, {link, ReceiverRequester, {attached, Attach}}} ->
                   #'v1_0.attach'{
                      source = #'v1_0.source'{
                                  address = {utf8, Addr0}}} = Attach,
                   Addr0
       end,

%% Requester must grant link credit before sending the first request.
ok = amqp10_client:flow_link_credit(ReceiverRequester, 1000, 500),

%% 2. Requester sends the request.
ok = amqp10_client:send_msg(
       SenderRequester,
       amqp10_msg:set_properties(
         #{message_id => RpcId,
           reply_to => Addr},
         amqp10_msg:new(DeliveryTag, RequestPayload, true))),

%% 3. Responder receives the request and reads relevant properties.
...
#{message_id := RpcId,
  reply_to := ReplyToAddr} = amqp10_msg:properties(RequestMsg),

%% Optionally, the responder checks whether the requester is still connected.
{ok, #{queue := ReplyQueue}} = rabbitmq_amqp_address:to_map(ReplyToAddr),
case rabbitmq_amqp_client:get_queue(LinkPairResponder, ReplyQueue) of
    {ok, #{}} ->
        %% requester is still there
        ok;
    _ ->
        throw(requester_absent)
end,

%% 4. Responder replies (attached to the anonymous terminus).
ok = amqp10_client:send_msg(
       SenderResponder,
       amqp10_msg:set_properties(
         #{to => ReplyToAddr,
           correlation_id => RpcId},
         amqp10_msg:new(Tag, ReplyPayload, true))),

%% 5. Requester receives the reply.
receive {amqp10_msg, ReceiverRequester, ReplyMsg} ->
            %% process reply here...
            ok
end.
```
</TabItem>
<TabItem value="Go" label="Go">
A complete example is available in the [tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go/rpc_amqp10.go).
```go
// RPC client creates a receiver
receiver, err := session.NewReceiver(ctx, "", &amqp.ReceiverOptions{
    SourceCapabilities:        []string{"rabbitmq:volatile-queue"},
    SourceExpiryPolicy:        amqp.ExpiryPolicyLinkDetach,
    DynamicAddress:            true,
    RequestedSenderSettleMode: amqp.SenderSettleModeSettled.Ptr(),
})

// RPC client uses the generated address when sending a request
replyAddress := receiver.Address()
requestMsg := &amqp.Message{
    Properties: &amqp.MessageProperties{
        MessageID: messageID,
        ReplyTo:   &replyAddress,
    },
    Data: ...,
}

// RPC server extracts the message ID and reply-to address

msg, _ := receiver.Receive(ctx, nil)
_ = receiver.AcceptMessage(ctx, msg)
messageID := msg.Properties.MessageID.(string)
replyTo := *msg.Properties.ReplyTo

// RPC server uses the reply-to value and message ID in its response
sender, _ := session.NewSender(ctx, replyTo, nil)

replyMsg := &amqp.Message{
    Properties: &amqp.MessageProperties{
        CorrelationID: messageID,
    },
    Data: ...,
}
```
</TabItem>
</Tabs>


### Usage in AMQP 0.9.1 {#usage-amqp091}

To use Direct Reply-To, a requester must:
1. Consume from the pseudo-queue `amq.rabbitmq.reply-to` in no-ack mode.
   There is no need to declare this "queue" first (though the client may).
2. Set the request message’s `reply-to` to `amq.rabbitmq.reply-to`.

When forwarding the request, RabbitMQ transparently rewrites `reply-to` to `amq.rabbitmq.reply-to.<opaque-suffix>`, where `<opaque-suffix>` is not meaningful to clients.
The responder then publishes the reply to the default exchange (`""`) using that value as the routing key.

If the responder will perform expensive work, it can check whether the client has gone away by passively declaring the generated reply queue name on a disposable channel.
Even with `passive=false` there is no way to create it; the declare either succeeds (0 ready messages, 1 consumer) or fails.

#### AMQP 0.9.1 Caveats and Limitations {#caveats-amqp091}

* The requester must consume in [automatic acknowledgement mode](./confirms#acknowledgement-modes).
  There is no queue to return a reply if the requester disconnects or rejects it.
* The requester must use the same connection and [channel](./channels) both to consume from `amq.rabbitmq.reply-to` and to publish the request.
* Replies sent via Direct Reply-To are not fault-tolerant; they are dropped if the client that published the request disconnects.
  The requester is expected to reconnect and resubmit the request.
* The name `amq.rabbitmq.reply-to` is used in `basic.consume` and the `reply-to` property as if it were a queue; however it is not.
  It cannot be deleted and does not appear in the management plugin or `rabbitmqctl list_queues`.
* If the responder publishes with the `mandatory` flag, `amq.rabbitmq.reply-to.*` is treated as a queue for routing.
  Whether the requester is still present is not checked at routing time.
  In other words, a message routed solely to this name is considered "routed", and RabbitMQ will not send a `basic.return`.
* The requester can create at most one Direct Reply-To consumer (`basic.consume`) per channel.

#### Examples: AMQP 0.9.1 {#examples-amqp091}

<Tabs groupId="languages">
<TabItem value="Erlang" label="Erlang">
```erlang
%% 1. Requester consumes from pseudo-queue in no-ack mode.
amqp_channel:subscribe(RequesterChan,
                       #'basic.consume'{queue = <<"amq.rabbitmq.reply-to">>,
                                        no_ack = true},
                       self()),
CTagRequester = receive #'basic.consume_ok'{consumer_tag = CTag} -> CTag
                end,

%% 2. Requester sends the request.
amqp_channel:cast(
  RequesterChan,
  #'basic.publish'{routing_key = RequestQueue},
  #amqp_msg{props = #'P_basic'{reply_to = <<"amq.rabbitmq.reply-to">>,
                               message_id = RpcId},
            payload = RequestPayload}),

%% 3. Responder receives the request.
{ReplyTo, RpcId} =
    receive {#'basic.deliver'{consumer_tag = CTagResponder},
             #amqp_msg{payload = RequestPayload,
                       props = #'P_basic'{reply_to = ReplyTo0,
                                          message_id = RpcId0}}} ->
                {ReplyTo0, RpcId0}
    end,

%% 4. Responder replies.
amqp_channel:cast(
  ResponderChan,
  #'basic.publish'{routing_key = ReplyTo},
  #amqp_msg{props = #'P_basic'{correlation_id = RpcId},
            payload = ReplyPayload}),

%% 5. Requester receives the reply
receive {#'basic.deliver'{consumer_tag = CTagRequester},
         #amqp_msg{payload = ReplyPayload,
                   props = #'P_basic'{correlation_id = RpcId}}} ->
            %% process reply here...
            ok
end.
```
</TabItem>
</Tabs>
