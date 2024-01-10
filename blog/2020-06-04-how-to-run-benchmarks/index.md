---
title: "How to Run Benchmarks"
tags: ["Performance", ]
authors: [jvanlightly]
---

There can be many reasons to do benchmarking:

* Sizing and capacity planning
* Product assessment (can RabbitMQ handle my load?)
* Discover best configuration for your workload

In this post we’ll take a look at the various options for running RabbitMQ benchmarks. But before we do, you’ll need a way to see the results and look at system metrics.

<!-- truncate -->

## RabbitMQ Observability

You have routed X number of messages per second through your RabbitMQ cluster and concluded that you have reached peak throughput, but have you considered:

* your CPU was maxed out at that point and wouldn’t have coped with any peak above that load
* you were close to your network bandwidth, disk IOPs etc and wouldn’t have coped with any peak on top of that load
* your end-to-end latency was in the minutes, not milliseconds
* you lost thousands of messages because you didn’t use confirms or acks while putting huge strain on the brokers and the network.

*You have to be able to see more than just a throughput number.* 

Since 3.8.0, we have made the rabbitmq_prometheus plugin available. [See how](/docs/prometheus) to get Grafana, Prometheus and RabbitMQ to work together and get amazing insight into your RabbitMQ instances.

See our [published Grafana dashboards](https://grafana.com/orgs/rabbitmq) for insight into not only the queue counts, connection counts, message rates etc, but also insight into what is going on under the hood from the Erlang perspective. There are also countless system metrics dashboards and agents you can install to see the system metrics such as CPU, RAM, network and disk IO. For example, check out the [node_exporter](https://github.com/prometheus/node_exporter) which gives insights into hardware and OS behaviour.

Another reason to use a solution like Prometheus is that when you push RabbitMQ to its limit, the management UI can become sluggish or unresponsive. The UI is trying to operate on a machine that might already be close to 100% CPU utilisation.

## Some Benchmarking Do’s and Don’ts

**Do:**

* use our observability tooling!
* try to model your benchmark workload to match your real workload as closely as you can, else you’ll be comparing apples to oranges.
* take the time to understand the concepts that can affect performance: publisher confirms, consumer acknowledgements, message size, queue counts (see next heading).
* make sure that the VM hosting your load generator is not the bottleneck. Either over-provision your load gen machine, or monitor it (CPU and network).
* beware of IaaS with burstable resources such as CPU, network and disk. If you only look at the first 30 minutes of your test you may think that your chosen disk is up to the task. If you’d left the benchmark running you might have seen throughput hit the floor as soon as your burst ran out.
* Beware that if you are running benchmarks in shared on-prem environments that might have complex networking setups (e.g. double NAT, VPC gateways, load balancers, firewall etc.) then you will not necessarily be benchmarking RabbitMQ, but your IT infrastructure. 

If you run a benchmark both in an isolated environment and in your main IT infrastructure, it can help you isolate and optimise sub-optimal areas of your prod/qa environment.

**Don’t:**

* run an end-to-end latency test without rate limiting the publishers. Latency tests are only useful when the load is within the brokers capacity.
* run a load generator (like [perf-test](https://github.com/rabbitmq/rabbitmq-perf-test/)) on the same machine as your RabbitMQ brokers.
* run a benchmark in a shared on-prem environment without telling your IT ops people first. Using up all the network bandwidth on your benchmark tends to get the blood flowing of your IT operations people.
* run a benchmark in cloud IaaS and then use those results to size an on-prem environment. There can be huge differences in performance depending on CPU generation, storage configuration, networking topology etc. There are even differences between clouds!

## Some Common Impacts on Performance

Below are some things you can expect as you vary different aspects of a benchmark.

* One queue has a throughput limit, so creating a few queues can increase total throughput. But creating hundreds of queues will then reduce total throughput. One or two queues per CPU thread tends to give highest throughput. More than that and the context switching will reduce efficiency.
* Using publisher confirms and consumer acknowledgements has lower throughput than not using them. But when using hundreds of publishers and queues, publisher confirms can actually improve performance as they act as an effective back-pressure mechanism on publishers - avoiding large swings in throughput (learn more about [flow control](/blog/2020/05/04/quorum-queues-and-flow-control-the-concepts)).
* Sending one message, waiting for the publisher confirm, then sending the next and so on, is very very slow. Using a batch or a pipelining strategy with publisher confirms increases throughput significantly ([/tutorials/tutorial-seven-java.html](/tutorials/tutorial-seven-java) or [/tutorials/tutorial-seven-dotnet.html](/tutorials/tutorial-seven-dotnet))
* Using no consumer prefetch will increase throughput (but it is not recommended as it can overwhelm a consumer - prefetch is how we exert back pressure on RabbitMQ). A prefetch of 1 will lower throughput significantly. Experiment with prefetch to find the right value for your workload.
* Sending small messages will increase throughput (though MB/s will be low) and sending large messages will decrease throughput (but MB/s will be high).
* Having a handful of publishers and consumers will result in the highest throughput. Creating thousands will result in lower total throughput.
* Classic queues are faster than replicated queues (mirrored/quorum). The larger the replication factor, the slower the queue.

One common pattern is that once you get past a few tens of queues and/or clients, total throughput will drop. The more connections and connection there are, the more context switching there is and the less efficient things become. There are only a limited number of CPU cores. If you have thousands of queues and clients then that is not a bad thing, but realise that you may not get the same total throughput compared to when you have tens or hundreds of clients/queues.

## Option #1 - Use Your Existing Applications

If you need to benchmark for capacity planning or to find the best configuration, then using your existing applications is most likely to yield the most useful results.

The trouble with synthetic benchmarks is that they tell you how your RabbitMQ installation will cope with loads generated by the chosen load generator, which may be quite different to your real usage.

The trouble with using your real applications is that generating load may take some work to set up. 

Secondly, unless you already have it instrumented, you won’t get end-to-end latency metrics. Of course you can add that. You could add a timestamp to a message header and extract that header in the consumer and publish the metric. Most languages have libraries for emitting metrics efficiently, without the need to hand-roll anything (for example [https://micrometer.io/](https://micrometer.io/)). Also take into account that without clock synchronisation like NTP, the end-to-end latency metrics will not be accurate, and even then, there may be jitter.

## Option #2 - Perf Test

PerfTest is our recommended tool for doing synthetic benchmarking of simple workloads with RabbitMQ. [PerfTest](https://github.com/rabbitmq/rabbitmq-perf-test) is on GitHub and has some nice [instructions](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/). To run it yourself, please follow the [installation instructions](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/#installation). 

It even has its own Grafana [dashboard](https://grafana.com/grafana/dashboards/6566)! 

## Option #3 - Perf Test + CloudFoundry

See our [workloads](https://github.com/rabbitmq/workloads) project on GitHub. It will show you have to deploy and test for various workloads on CloudFoundry.

## Option #4 - RabbitTestTool

This is an [*experimental* tool](https://github.com/Vanlightly/RabbitTestTool) that I use (and built) personally to do [automated exploratory testing](https://jack-vanlightly.com/blog/2020/5/26/with-great-observation-comes-great-insight). It is a powerful but complex tool and probably not your ideal choice for that reason. It’s more of a QA tool than for customers to benchmark their own setups.

But it has some features that might interest you.

Firstly it has a [*model driven, property based test mode*](https://github.com/Vanlightly/RabbitTestTool/blob/master/benchmark/README.md#running-a-model-driven-property-based-test) that detects data loss, ordering violations (without redelivered flag), duplicate delivery (without redelivered flag) and availability. It is the data loss and availability detection that might interest you. Duplicates and ordering are only useful in our alpha and pre-alpha builds that might have bugs in new features.

You can use this tool to practice a blue/green deployment or a rolling upgrade, to ensure that you can perform the operation without data loss and availability.

It also has highly customisable EC2 deployment and benchmark orchestration. It is possible to set up many side-by-side benchmarks on different AWS hardware, RabbitMQ versions and configurations. But, again, this is so configurable that it is also complex.

## Option #5 - RabbitMQ Benchmark X-Project

Ok so the name is a work-in-progress, but it represents a new project which we aim to benefit our own team but also the wider community, it will be the one benchmark project to rule them all.

The plan is to use a benchmark tool like PerfTest plus the Kubernetes API to combine both orchestration (the brokers, the disks etc) and the benchmark tool itself. Orchestration (deployment of RabbitMQ, load gen, observability) is often the most onerous part of benchmarking so we hope this project will solve that once and for all - not just for us but for *everyone*.

## Wrap-Up

Benchmarking can be hard to get right, but if done correctly it can provide valuable information. The key is to use as much of the observability tooling as possible and to try and model your actual workloads as closely as possible. It is hugely important to understand the usage of publisher confirms and consumer acknowledgements, [their role in flow control](/blog/2020/05/14/quorum-queues-and-flow-control-single-queue-benchmarks) and the impact they have on performance.

In subsequent blog posts that cover performance I’ll be including the PerfTest arguments that you’ll need to recreate the load generation side of things.
