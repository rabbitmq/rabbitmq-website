<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Debugging the RabbitMQ Kubernetes Operators

This information describes how to debug a running instance of the RabbitMQ Kubernetes Operators.

## <a id="operator-resource-usage-profiling" class="anchor" href="#operator-resource-usage-profiling">Retrieve Information about CPU/Memory Usage for the Kubernetes Operator Pods</a>

<p class="box-warning">
<b>Important:</b> Do not complete the following steps on a production system.
</p>

By using the [pprof tool](https://github.com/google/pprof/blob/main/doc/README.md), you can expose CPU and memory profiling data for the Kubernetes Operator Pods. Profiling is a debugging technique used to generate data about how a piece of software is running by exposing information about the software's consumption of memory, CPU, and asynchronicity.

You might want to do this if you are seeing high resource consumption on one of your Operator Pods for example. To use the `pprof` tool, enable it by completing the following steps:

1. Enable the `ENABLE_DEBUG_PPROF` variable on the operator that you want to retrieve debugging information from by running the following command. For example, for the Cluster Operator, run:
<pre class="lang-bash">
$ kubectl -n rabbitmq-system set env deployment/rabbitmq-cluster-operator ENABLE_DEBUG_PPROF=True
deployment.apps/rabbitmq-cluster-operator env updated
</pre>

2. Using kubectl, complete a `port-forward` operation so that metrics can be collected on your machine from the correct port on the Operator Pod. For the RabbitMQ Cluster Operator, the default port is <code>9782</code> and for all other operators, the port is <code>8080</code>. For example, to complete the `port-forward` operation on the RabbitMQ Cluster Operator Pod, run:
<pre class="lang-bash">
$ kubectl -n rabbitmq-system port-forward deployment/rabbitmq-cluster-operator 9782
Forwarding from 127.0.0.1:9782 -> 9782
Forwarding from [::1]:9782 -> 9782
</pre>

3. In a separate terminal, you can now use the <code>go tool pprof</code> to profile the Operator Pod. For example, to analyse
memory allocations in the Pod, run:

<pre class="lang-bash">
$ go tool pprof "localhost:9782/debug/pprof/heap"
Fetching profile over HTTP from http://localhost:9782/debug/pprof/heap
Saved profile in /home/pprof/pprof.manager.alloc_objects.alloc_space.inuse_objects.inuse_space.001.pb.gz
</pre>

This opens a browser window to visualise the memory allocations in the profile.
For more information on how to use pprof, see [here](https://github.com/google/pprof/blob/main/doc/README.md).

The following tables lists the profiles that are exposed by the Operators.

<table>
<thead>
  <tr>
    <th>Path</th>
    <th>Profile Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>/debug/pprof</td>
    <td>A list of all the profiles that are available on the system.</td>
  </tr>
  <tr>
    <td>/debug/pprof/allocs</td>
    <td>A sample of all past memory allocations.</td>
  </tr>
  <tr>
    <td>/debug/pprof/block</td>
    <td>Stack traces that led to blocking on synchronization primitives.</td>
  </tr>
  <tr>
    <td>/debug/pprof/cmdline</td>
    <td>The command line invocation of the current program.</td>
  </tr>
  <tr>
    <td>/debug/pprof/goroutine</td>
    <td>Stack traces of all current goroutines.</td>
  </tr>
  <tr>
    <td>/debug/pprof/heap</td>
    <td>A sample of memory allocations of live objects. You can specify the `gc`GET parameter to run GC before taking the heap sample. For example:  /debug/pprof/heap?gc=1</td>
  </tr>
  <tr>
    <td>/debug/pprof/mutex</td>
    <td>Stack traces of holders of contended mutexes.</td>
  </tr>
  <tr>
    <td>/debug/pprof/profile</td>
    <td>CPU profile. You can specify the duration in the `seconds` GET parameter. For example: /debug/pprof/profile?seconds=5</td>
  </tr>
  <tr>
    <td>/debug/pprof/threadcreate</td>
    <td>Stack traces that lead to new OS threads being created.</td>
  </tr>
  <tr>
    <td>/debug/pprof/trace</td>
    <td>A trace of the execution of the current program. You can specify the duration in the `seconds` GET parameter. For example: /debug/pprof/trace?seconds=5</td>
  </tr>
</tbody>
</table>
