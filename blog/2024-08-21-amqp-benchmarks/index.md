---
title: "AMQP 1.0 Benchmarks"
tags: ["AMQP 1.0", "RabbitMQ 4.0", "Performance"]
authors: [dansari]
image: ./throughput-classic-queue.svg
---

This blog post demonstrates that [native AMQP 1.0](/blog/2024/08/05/native-amqp) in RabbitMQ 4.0 provides significant performance and scalability improvements compared to AMQP 1.0 in RabbitMQ 3.13.

Additionally, this blog post suggests that AMQP 1.0 can perform slightly better than AMQP 0.9.1 in RabbitMQ 4.0.

<!-- truncate -->

<details>
<summary>Setup</summary>

The following setup applies to all benchmarks in this blog post:
* Intel NUC 11
* 8 CPU cores
* 32 GB RAM
* Ubuntu 22.04
* Single node RabbitMQ server
* Server runs with (only) 3 scheduler threads (set via [runtime flags](https://www.erlang.org/doc/apps/erts/erl_cmd.html#emulator-flags) as `+S 3`)
* Erlang/OTP 27.0.1
* Clients and server run on the same box

We use the latest RabbitMQ versions at the time of writing:
* [v4.0.0-beta.5](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0-beta.5)
* [v3.13.6](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.13.6)

The following [advanced.config](/docs/configure#advanced-config-file) is applied:

```erl
[
 {rabbit, [
  {loopback_users, []}
 ]},

 {rabbitmq_management_agent, [
  {disable_metrics_collector, true}
 ]}
].
```

Metrics collection is disabled in the `rabbitmq_management_agent` plugin.
For [production environments](https://www.rabbitmq.com/docs/production-checklist), [Prometheus](https://www.rabbitmq.com/docs/prometheus) is the recommended option.

RabbitMQ server is started as follows:
```bash
make run-broker \
    TEST_TMPDIR="$HOME/scratch/rabbit/test" \
    RABBITMQ_CONFIG_FILE="$HOME/scratch/rabbit/advanced.config" \
    PLUGINS="rabbitmq_prometheus rabbitmq_management rabbitmq_amqp1_0" \
    RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+S 3"
```
The `rabbitmq_amqp1_0` plugin is a [no-op plugin](https://github.com/rabbitmq/rabbitmq-server/blob/v4.0.0-beta.5/deps/rabbitmq_amqp1_0/README.md) in RabbitMQ 4.0.

The AMQP 1.0 benchmarks run [quiver](https://github.com/ssorj/quiver) in a Docker container:
```
$ docker run -it --rm --add-host host.docker.internal:host-gateway ssorj/quiver:latest
bash-5.1# quiver --version
quiver 0.4.0-SNAPSHOT
```
</details>

## Classic Queues

This section benchmarks [classic queues](/docs/classic-queues).

We declare a classic queue called `my-classic-queue`:
```bash
deps/rabbitmq_management/bin/rabbitmqadmin declare queue \
    name=my-classic-queue queue_type=classic durable=true
```

### AMQP 1.0 in 4.0

The client sends and receives 1 million messages.
Each message contains a payload of 12 bytes.
The receiver repeatedly tops up 200 [link credits](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#doc-flow-control) at a time.

```
# quiver //host.docker.internal//queues/my-classic-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 200

RESULTS

Count ............................................. 1,000,000 messages
Duration ............................................... 10.1 seconds
Sender rate .......................................... 99,413 messages/s
Receiver rate ........................................ 99,423 messages/s
End-to-end rate ...................................... 99,413 messages/s

Latencies by percentile:

          0% ........ 0 ms       90.00% ........ 1 ms
         25% ........ 1 ms       99.00% ........ 2 ms
         50% ........ 1 ms       99.90% ........ 2 ms
        100% ........ 9 ms       99.99% ........ 9 ms
```

### AMQP 1.0 in 3.13

```
# quiver //host.docker.internal//amq/queue/my-classic-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 200

RESULTS

Count ............................................. 1,000,000 messages
Duration ............................................... 45.9 seconds
Sender rate .......................................... 43,264 messages/s
Receiver rate ........................................ 21,822 messages/s
End-to-end rate ...................................... 21,790 messages/s

Latencies by percentile:

          0% ....... 67 ms       90.00% .... 24445 ms
         25% .... 23056 ms       99.00% .... 24780 ms
         50% .... 23433 ms       99.90% .... 24869 ms
        100% .... 24873 ms       99.99% .... 24873 ms
```

The same benchmark against RabbitMQ 3.13 results in 4.5 times lower throughput.

<details>
<summary>Detailed test execution</summary>
```
---------------------- Sender -----------------------  --------------------- Receiver ----------------------  --------
Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Lat [ms]
-----------------------------------------------------  -----------------------------------------------------  --------
     2.1        130,814      65,342        8     79.1       2.1          3,509       1,753        1      7.5       777
     4.1        206,588      37,849        6     79.1       4.1          5,995       1,242        0      7.5     2,458
     6.1        294,650      43,987        6     79.1       6.1          9,505       1,753        1      7.5     5,066
     8.1        360,184      32,734        5     79.4       8.1         13,893       2,194        0      7.5     6,190
    10.1        458,486      49,102        6     79.4      10.1         15,793         950        1      7.5     9,259
    12.1        524,020      32,734        5     79.4      12.1         21,644       2,923        1      7.5    11,163
    14.1        622,322      49,102        5     79.4      14.1         25,154       1,753        1      7.5    13,451
    16.1        687,856      32,734        4     79.4      16.1         27,639       1,241        1      7.5    15,246
    18.1        786,158      49,102        6     81.0      18.1         30,124       1,241        1      7.5    17,649
    20.1        884,460      49,102        6     81.0      20.1         32,610       1,242        1      7.5    19,408
    22.1        949,994      32,734        4     81.0      22.1         35,535       1,462        0      7.5    21,293
    24.1        999,912      24,934        4     81.8      24.1         38,167       1,315        1      7.5    23,321
    26.1        999,974          31        2      0.0      26.1        117,745      39,749       11      7.5    24,475
       -              -           -        -        -      28.1        202,589      42,380       11      7.5    24,364
       -              -           -        -        -      30.1        292,554      44,938       13      7.5    24,244
       -              -           -        -        -      32.1        377,691      42,526       15      7.5    23,955
       -              -           -        -        -      34.1        469,704      45,961       14      7.5    23,660
       -              -           -        -        -      36.1        555,719      42,965       12      7.5    23,463
       -              -           -        -        -      38.1        649,048      46,618       12      7.5    23,264
       -              -           -        -        -      40.1        737,696      44,280       15      7.5    23,140
       -              -           -        -        -      42.1        826,491      44,353       15      7.5    23,100
       -              -           -        -        -      44.1        917,187      45,303       16      7.5    23,066
       -              -           -        -        -      46.1        999,974      41,394       14      0.0    22,781
```
</details>

### AMQP 0.9.1 in 4.0

For our AMQP 0.9.1 benchmarks we use [PerfTest](https://perftest.rabbitmq.com/).
We try to run a somewhat fair comparison of our previous AMQP 1.0 benchmark.

Since an AMQP 1.0 [/queues/:queue](/docs/amqp#target-address-v2) target address sends to the default exchange, we also send to the default exchange via AMQP 0.9.1.
Since we used [durable](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-header) messages with AMQP 1.0, we set the `persistent` flag in AMQP 0.9.1.
Since RabbitMQ settles with the [released](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-released) outcome when a message cannot be routed, we set the `mandatory` flag in AMQP 0.9.1.
Since RabbitMQ `v4.0.0-beta.5` uses a default `rabbit.max_link_credit` of 128 granting 128 more credits to the sending client when remaining credit falls below 0.5 * 128, we configure the AMQP 0.9.1 publisher to have at most 1.5 * 128 = 192 messages unconfirmed at a time.
Since we used 200 link credits in the previous run, we configure the AMQP 0.9.1 consumer with a [prefetch](/docs/consumer-prefetch) of 200.

```
$ java -jar target/perf-test.jar \
    --predeclared --exchange amq.default \
    --routing-key my-classic-queue --queue my-classic-queue \
    --flag persistent --flag mandatory \
    --pmessages 1000000 --size 12 --confirm 192 --qos 200 --multi-ack-every 200

id: test-151706-485, sending rate avg: 88534 msg/s
id: test-151706-485, receiving rate avg: 88534 msg/s
id: test-151706-485, consumer latency min/median/75th/95th/99th 99/975/1320/1900/2799 µs
id: test-151706-485, confirm latency min/median/75th/95th/99th 193/1691/2113/2887/3358 µs
```

### Summary {#summary-classic-queues}

![Figure 1: Classic queue end-to-end message rate](throughput-classic-queue.svg)

## Quorum Queues

This section benchmarks [quorum queues](/docs/quorum-queues).

We declare a quorum queue called `my-quorum-queue`:
```bash
deps/rabbitmq_management/bin/rabbitmqadmin declare queue \
    name=my-quorum-queue queue_type=quorum durable=true
```

#### Flow Control Configuration

For highest data safety, quorum queues [fsync](https://man7.org/linux/man-pages/man2/fsync.2.html) all [Ra](https://github.com/rabbitmq/ra) commands including:
* [enqueue](https://github.com/rabbitmq/rabbitmq-server/blob/v4.0.0-beta.5/deps/rabbit/src/rabbit_fifo.erl#L144): sender enqueues a message
* [settle](https://github.com/rabbitmq/rabbitmq-server/blob/v4.0.0-beta.5/deps/rabbit/src/rabbit_fifo.erl#L149): receiver accepts a message
* [credit](https://github.com/rabbitmq/rabbitmq-server/blob/v4.0.0-beta.5/deps/rabbit/src/rabbit_fifo.erl#L152): receiver tops up link credit

Before a quorum queue confirms receipt of a message to the publisher, it ensures that any file modifications are flushed to disk, making the data safe even if the RabbitMQ node crashes shortly after.

The SSD of my Linux box is slow, taking 5-15 ms per fsync.
Since we want to compare AMQP protocol implementations without being bottlenecked by a cheap disk, the tests in this section increase flow control settings:
<details>
<summary>`advanced.config`</summary>

```
[
 {rabbit, [
  {loopback_users, []},

  %% RabbitMQ internal flow control for AMQP 0.9.1
  %% Default: {400, 200}
  {credit_flow_default_credit, {5000, 2500}},

  %% Maximum incoming-window of AMQP 1.0 session.
  %% Default: 400
  {max_incoming_window, 5000},

  %% Maximum link-credit RabbitMQ grants to AMQP 1.0 sender.
  %% Default: 128
  {max_link_credit, 2000},

  %% Maximum link-credit RabbitMQ AMQP 1.0 session grants to sending queue.
  %% Default: 256
  {max_queue_credit, 5000}
 ]},

 {rabbitmq_management_agent, [
  {disable_metrics_collector, true}
 ]}
].
```
</details>
This configuration allows more Ra commands to be batched before RabbitMQ calls fsync.
**For production use cases, we recommend enterprise-grade high performance disks that fsync faster**, in which case there is likely no need to increase flow control settings.

RabbitMQ flow control settings present a trade-off:
* Low values ensure stability in production.
* High values can result in higher performance for individual connections but may lead to higher memory spikes when many connections publish large messages concurrently.

RabbitMQ uses conservative flow control default settings to favour stability in production over winning performance benchmarks.

### AMQP 1.0 in 4.0

```
# quiver //host.docker.internal//queues/my-quorum-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000

RESULTS

Count ............................................. 1,000,000 messages
Duration ............................................... 12.0 seconds
Sender rate .......................................... 83,459 messages/s
Receiver rate ........................................ 83,396 messages/s
End-to-end rate ...................................... 83,181 messages/s

Latencies by percentile:

          0% ........ 9 ms       90.00% ....... 47 ms
         25% ....... 27 ms       99.00% ....... 61 ms
         50% ....... 35 ms       99.90% ....... 76 ms
        100% ....... 81 ms       99.99% ....... 81 ms
```

<details>
<summary>Default Flow Control Settings</summary>

The previous benchmark calls fsync 1,244 times in the [ra_log_wal](https://github.com/rabbitmq/ra/blob/e95ab7b9df1f8f4ffec8535d60185b3bc33a09bc/src/ra_log_wal.erl#L770) module (that implements the Raft write-ahead log).

The same benchmark with default flow control settings calls fsync 15,493 times resulting in significantly lower throughput:
```
# quiver //host.docker.internal//queues/my-quorum-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000

RESULTS

Count ............................................. 1,000,000 messages
Duration .............................................. 100.2 seconds
Sender rate ........................................... 9,986 messages/s
Receiver rate ......................................... 9,987 messages/s
End-to-end rate ....................................... 9,983 messages/s

Latencies by percentile:

          0% ....... 10 ms       90.00% ....... 24 ms
         25% ....... 14 ms       99.00% ....... 30 ms
         50% ....... 18 ms       99.90% ....... 38 ms
        100% ....... 55 ms       99.99% ....... 47 ms
```

Each fsync took 5.9 ms on average.

```
(15,493 - 1,244) * 5.9 ms = 84 seconds
```

Therefore, this benchmark with default flow control settings is blocked for 84 seconds longer executing `fsync` than the previous benchmark with increased flow control settings.
This shows how critical enterprise-grade high performance disks are to get the best results out of quorum queues.
For your production workloads, we recommend using disks with lower `fsync` latency rather than tweaking
RabbitMQ flow control settings.

It's worth noting that the Raft WAL log is shared by all quorum queue replicas on a given RabbitMQ node.
This means that `ra_log_wal` will automatically batch multiple Raft commands (operations) into a single `fsync`
call when there are dozens of quorum queues with hundreds of connections.
Consequently, flushing an individual Ra command to disk becomes cheaper on average when there is more traffic on the node.
Our benchmark ran somewhat artificially with a single connection as fast as possible.
</details>

### AMQP 1.0 in 3.13

```
# quiver //host.docker.internal//amq/queue/my-quorum-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000

---------------------- Sender -----------------------  --------------------- Receiver ----------------------  --------
Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Lat [ms]
-----------------------------------------------------  -----------------------------------------------------  --------
     2.1        163,582      81,709       11     84.2       2.1         29,548      14,759        3      7.5       840
     4.1        336,380      86,356       12    185.3       4.1         29,840         146        0      7.5     2,331
     6.1        524,026      93,729       14    328.0       6.1         29,840           0        0      7.5         0
     8.1        687,864      81,837       11    462.3       8.1         31,302         730        1      7.5     6,780
    10.1        884,470      98,303       14    605.4      10.1         31,447          72        0      7.5     7,897
    12.1        999,924      57,669        7    687.5      12.1         31,447           0        0      7.5         0
    14.1        999,924           0        0    687.5      14.1         31,447           0        0      7.5         0
    16.1        999,924           0        0    687.5      16.1         31,447           0        1      7.5         0
    18.1        999,924           0        1    688.3      18.1         31,447           0        0      7.5         0
receiver timed out
    20.1        999,924           0        0    688.3      20.1         31,447           0        0      7.5         0
```
RabbitMQ 3.13 cannot handle this workload and the benchmark fails.

<details>
<summary>Default Flow Control Settings</summary>

The benchmark also fails with default flow control settings:
```
# quiver //host.docker.internal//amq/queue/my-quorum-queue \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000

---------------------- Sender -----------------------  --------------------- Receiver ----------------------  --------
Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Lat [ms]
-----------------------------------------------------  -----------------------------------------------------  --------
     2.1        130,814      65,342        9     70.0       2.1         26,915      13,437        6      7.5     1,213
     4.1        196,348      32,718        5     70.2       4.1         28,084         584        0      7.5     3,093
     6.1        261,882      32,734        7     70.2       6.1         30,131       1,022        1      7.5     4,952
     8.1        360,184      49,126        6     70.2       8.1         32,325       1,096        0      7.5     6,637
    10.1        425,718      32,734        6     70.2      10.1         34,225         949        1      7.5     8,089
    12.1        491,252      32,734        5     70.2      12.1         34,225           0        0      7.5         0
    14.1        589,554      49,102        7     70.2      14.1         34,225           0        0      7.5         0
    16.1        655,088      32,734        5     70.2      16.1         34,225           0        0      7.5         0
    18.1        720,622      32,734        6     70.2      18.1         34,225           0        0      7.5         0
receiver timed out
```
</details>

### AMQP 0.9.1 in 4.0

Since we set `max_link_credit` to 2,000, we allow for a maximum of 2,000 * 1.5 = 3,000 unconfirmed messages in the publisher.
```
$ java -jar target/perf-test.jar \
    --predeclared --exchange amq.default \
    --routing-key my-quorum-queue --queue my-quorum-queue \
    --flag persistent --flag mandatory \
    --pmessages 1000000 --size 12 --confirm 3000 --qos 5000 --multi-ack-every 5000

id: test-085526-136, sending rate avg: 70067 msg/s
id: test-085526-136, receiving rate avg: 70067 msg/s
id: test-085526-136, consumer latency min/median/75th/95th/99th 8803/33127/40424/53407/62883 µs
id: test-085526-136, confirm latency min/median/75th/95th/99th 8551/30323/38317/52103/63131 µs
```

<details>
<summary>Default Flow Control Settings</summary>

```
$ java -jar target/perf-test.jar \
    --predeclared --exchange amq.default \
    --routing-key my-quorum-queue --queue my-quorum-queue \
    --flag persistent --flag mandatory \
    --pmessages 1000000 --size 12 --confirm 192 --qos 5000 --multi-ack-every 5000

id: test-084359-441, sending rate avg: 9931 msg/s
id: test-084359-441, receiving rate avg: 9931 msg/s
id: test-084359-441, consumer latency min/median/75th/95th/99th 7512/17054/26256/34249/38641 µs
id: test-084359-441, confirm latency min/median/75th/95th/99th 9432/16586/23918/32636/36858 µs
```
These results are similar to the results of the default flow control settings in AMQP 1.0 in 4.0 because both benchmarks are bottlenecked by my slow disk.
</details>

### Summary {#summary-quorum-queues}

![Figure 2: Quorum queue end-to-end message rate](throughput-quorum-queue.svg)

## Streams

This sections benchmarks [streams](/docs/streams).

We declare a stream called `my-stream`:
```bash
deps/rabbitmq_management/bin/rabbitmqadmin declare queue \
    name=my-stream queue_type=stream durable=true
```

(We run with default RabbitMQ flow control settings.)

We want the receiver to start consuming from the very beginning of the stream.
Quiver doesn't support passing a `filter` field to the [source](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source) where we could specify a `rabbitmq:stream-offset-spec` value `first`.
Therefore, for this benchmark it's easier to patch RabbitMQ to use stream offset spec `first` by default instead of `next`:
<details>
<summary>git diff</summary>

```
diff --git a/deps/rabbit/src/rabbit_stream_queue.erl b/deps/rabbit/src/rabbit_stream_queue.erl
index e36ad708eb..acd193d76f 100644
--- a/deps/rabbit/src/rabbit_stream_queue.erl
+++ b/deps/rabbit/src/rabbit_stream_queue.erl
@@ -344,7 +344,7 @@ consume(Q, Spec, #stream_client{} = QState0)
                        {term(), non_neg_integer()}) ->
     {ok, osiris:offset_spec()} | {error, term()}.
 parse_offset_arg(undefined) ->
-    {ok, next};
+    {ok, first};
 parse_offset_arg({_, <<"first">>}) ->
     {ok, first};
 parse_offset_arg({_, <<"last">>}) ->
```
</details>

### AMQP 1.0 in 4.0
```
# quiver //host.docker.internal//queues/my-stream \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000
---------------------- Sender -----------------------  --------------------- Receiver ----------------------  --------
Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Lat [ms]
-----------------------------------------------------  -----------------------------------------------------  --------
     2.1        278,782     139,321       25      8.0       2.1        215,185     107,539       22      7.6       224
     4.1        554,492     137,717       25      8.0       4.1        434,027     109,312       24      7.6       651
     6.1        825,082     135,160       25      8.0       6.1        650,236     107,997       26      7.6     1,079
     8.1        999,992      87,368       17      0.0       8.1        888,973     119,249       29      7.6     1,469
       -              -           -        -        -      10.1        999,993      55,455       13      0.0     1,583

RESULTS

Count ............................................. 1,000,000 messages
Duration ................................................ 8.9 seconds
Sender rate ......................................... 136,705 messages/s
Receiver rate ....................................... 112,587 messages/s
End-to-end rate ..................................... 112,196 messages/s

Latencies by percentile:

          0% ........ 7 ms       90.00% ..... 1553 ms
         25% ...... 519 ms       99.00% ..... 1612 ms
         50% ..... 1011 ms       99.90% ..... 1615 ms
        100% ..... 1616 ms       99.99% ..... 1616 ms
```
It is easy to observe a substantially higher throughput.

Note that end-to-end latencies are very high just because the sender can write into the stream at a higher rate than RabbitMQ being able
to dispatch messages to the consumer ("receiver" in `quiver` terms).

### AMQP 1.0 in 3.13
```
# quiver //host.docker.internal//amq/queue/my-stream \
    --durable --count 1m --duration 10m --body-size 12 --credit 5000

---------------------- Sender -----------------------  --------------------- Receiver ----------------------  --------
Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Time [s]      Count [m]  Rate [m/s]  CPU [%]  RSS [M]  Lat [ms]
-----------------------------------------------------  -----------------------------------------------------  --------
     2.1        196,350      98,077       12     70.1       2.1          4,094       2,045        0      7.7       195
     4.1        392,956      98,205       13    138.5       4.1          4,094           0        0      7.7         0
     6.1        524,026      65,470       10    196.5       6.1          4,094           0        0      7.7         0
     8.1        655,096      65,470       11    259.4       8.1          4,094           0        0      7.7         0
    10.1        786,166      65,470       10    307.5      10.1          4,094           0        0      7.7         0
receiver timed out
    12.1        917,236      65,470        9    355.5      12.1          4,094           0        0      7.7         0
```
RabbitMQ 3.13 cannot handle this workload and the benchmark fails.

### AMQP 0.9.1 in 4.0

```
$ java -jar target/perf-test.jar \
    --predeclared --exchange amq.default \
    --routing-key my-stream --queue my-stream \
    --flag persistent --flag mandatory \
    --pmessages 1000000 --size 12 --confirm 192 --qos 5000 --multi-ack-every 5000

id: test-104223-225, sending rate avg: 88912 msg/s
id: test-104223-225, receiving rate avg: 88912 msg/s
id: test-104223-225, consumer latency min/median/75th/95th/99th 701/1340/1523/2500/4524 µs
id: test-104223-225, confirm latency min/median/75th/95th/99th 788/1983/2130/2437/2970 µs
```

Since streams store messages in AMQP 1.0 format, this workload requires RabbitMQ to translate each message between AMQP 0.9.1 and AMQP 1.0.
This explains why stream throughput is lower when using AMQP 0.9.1 clients compared to AMQP 1.0 clients.

### Summary {#summary-streams}

![Figure 3: Stream end-to-end message rate](throughput-stream.svg)

## Many Connections

This section compares memory usage of connecting 40,000 clients with two AMQP 1.0 sessions / AMQP 0.9.1 channels per connection.

<details>
<summary>Setup</summary>

```bash
make run-broker \
    TEST_TMPDIR="$HOME/scratch/rabbit/test" \
    RABBITMQ_CONFIG_FILE="$HOME/scratch/rabbit/rabbitmq.conf" \
    PLUGINS="rabbitmq_amqp1_0" \
    RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+P 3000000 +S 6" \
    ERL_MAX_PORTS=3000000 
```

In the following `rabbitmq.conf`, we use small buffer sizes to better compare the memory usage of the protocol implementations.
```ini
tcp_listen_options.sndbuf = 2048
tcp_listen_options.recbuf = 2048
vm_memory_high_watermark.relative = 0.95
vm_memory_high_watermark_paging_ratio = 0.95
loopback_users = none
```

<details>
<summary>AMQP 1.0</summary>

```go
package main

import (
	"context"
	"log"
	"time"

	"github.com/Azure/go-amqp"
)

func main() {
	for i := 0; i < 40_000; i++ {
		if i%1000 == 0 {
			log.Printf("opened %d connections", i)
		}
		conn, err := amqp.Dial(
			context.TODO(),
			"amqp://localhost",
			&amqp.ConnOptions{SASLType: amqp.SASLTypeAnonymous()})
		if err != nil {
			log.Fatal("open connection:", err)
		}
		_, err = conn.NewSession(context.TODO(), nil)
		if err != nil {
			log.Fatal("begin session:", err)
		}
		_, err = conn.NewSession(context.TODO(), nil)
		if err != nil {
			log.Fatal("begin session:", err)
		}
	}
	log.Println("opened all connections")
	time.Sleep(5 * time.Hour)
}
```
</details>

<details>
<summary>AMQP 0.9.1</summary>

```go
package main

import (
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	for i := 0; i < 40_000; i++ {
		if i%1000 == 0 {
			log.Printf("opened %d connections", i)
		}
		conn, err := amqp.Dial("amqp://guest:guest@localhost")
		if err != nil {
			log.Fatal("open connection:", err)
		}
		_, err = conn.Channel()
		if err != nil {
			log.Fatal("open channel:", err)
		}
		_, err = conn.Channel()
		if err != nil {
			log.Fatal("open channel:", err)
		}
	}
	log.Println("opened all connections")
	time.Sleep(5 * time.Hour)
}
```
</details>
</details>

The examples below directly invoke [`erlang:memory/0`](https://www.erlang.org/doc/apps/erts/erlang.html#memory/0) on the node,
a function that returns the memory size in bytes for each memory type.

<details>
<summary>`rabbitmq-diagnostics`</summary>

To retrieve the same information from a running node, use [CLI](/docs/cli) command [rabbitmq-diagnostics](/docs/man/rabbitmq-diagnostics.8) like so:

``` shell
rabbitmq-diagnostics memory_breakdown
```

This command can format the numbers using different information units (e.g. MiB, GiB) and supports JSON
output with `--formatter=json`:

``` shell
# pipes the output to `jq` for more readable formatting
rabbitmq-diagnostics memory_breakdown --formatter=json | jq
```
</details>

### AMQP 1.0 in 4.0

Here are the runtime-reported memory footprint numbers:

```erlang
1> erlang:memory().
[{total,5330809208},
 {processes,4788022888},
 {processes_used,4787945960},
 {system,542786320},
 {atom,999681},
 {atom_used,974364},
 {binary,194810368},
 {code,19328950},
 {ets,94161808}]

2> erlang:system_info(process_count).
360312
```

### AMQP 1.0 in 3.13

To compare, the runtime-reported memory footprint numbers in this test are:

```erlang
1> erlang:memory().
[{total,12066294144},
 {processes,11156497904},
 {processes_used,11156461208},
 {system,909796240},
 {atom,1089809},
 {atom_used,1062780},
 {binary,192784464},
 {code,22068126},
 {ets,318872128}]

2> erlang:system_info(process_count).
1480318
```

We observe that the memory usage of `processes` in RabbitMQ 3.13 is 11.1 GB compared to only 4.8 GB in RabbitMQ 4.0 (a reduction of about 56%).
As explained in the [previous](/blog/2024/08/05/native-amqp#amqp-10-in-rabbitmq-313) blog post, the RabbitMQ 3.13 implementation of AMQP 1.0 is resource heavy because each AMQP 1.0 session in the plugin includes an AMQP 0.9.1 client and maintains AMQP 0.9.1 state.

### AMQP 0.9.1 in 4.0
```erlang
1> erlang:memory().
[{total,5409763512},
 {processes,4716150248},
 {processes_used,4715945080},
 {system,693613264},
 {atom,991489},
 {atom_used,962578},
 {binary,187229040},
 {code,19118766},
 {ets,235605424}]

2> erlang:system_info(process_count).
600314
```

### Summary {#summary-many-connections}

![Figure 4: Memory usage of 40,000 connections and 80,000 sessions / channels](memory-many-connections.svg)

## Conclusion

This blog post demonstrated that the new native AMQP 1.0 implementation in RabbitMQ 4.0 performs multiple times better than AMQP 1.0 in RabbitMQ 3.13.

We also observed that AMQP 1.0 can perform better than AMQP 0.9.1.
However, it’s challenging to provide a fair comparison.
This blog post used an AMQP 1.0 client written in C and an AMQP 0.9.1 client written in Java.
Therefore, we do not claim or promise that you will observe better throughput with your AMQP 1.0 workloads.
The AMQP 0.9.1 implementation in RabbitMQ performs well since it has been stable and optimized for over 15 years.

Use cases where AMQP 1.0 will likely outperform AMQP 0.9.1 include:
* Sending to or receiving from a stream because a stream encodes messages in AMQP 1.0 format (as covered in this blog post).
* Leveraging queue locality using the [RabbitMQ AMQP 1.0 Java client](https://github.com/rabbitmq/rabbitmq-amqp-java-client). (This feature will be covered separately.)
* Publishing to or consuming from other queues when one target queue reaches its limits on the same connection (as covered in the [AMQP 1.0 flow control](/blog/2024/09/02/amqp-flow-control) blog post).
