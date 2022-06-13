<!--
Copyright (c) 2020-2021 VMware, Inc. or its affiliates.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers how to debug a running instance of the RabbitMQ Kubernetes Operators.

## <a id="operator-resource-usage-profiling" class="anchor" href="#operator-resource-usage-profiling">Profiling CPU / memory usage of the Operator Pods</a>

<p class="box-warning">
<b>N.B.:</b> It is not recommended to try these steps on a production system.
</p>

The RabbitMQ Operators are all able to expose CPU & memory profiling data through the [pprof tool](https://github.com/google/pprof/blob/main/doc/README.md).
If you are seeing high resource consumption on one of your Operator Pods, you can access this data by enabling this feature.

Patch the Operator Pod you would like to profile with the `ENABLE_DEBUG_PPROF` environment variable set to `True`. For example, for the Cluster Operator:
<pre class="lang-bash">
$ kubectl -n rabbitmq-system set env deployment/rabbitmq-cluster-operator ENABLE_DEBUG_PPROF=True
deployment.apps/rabbitmq-cluster-operator env updated
</pre>

Port-forward to the Operator Pod using kubectl. You will want to forward to the metrics port on the Operator Pod, which
by default is <code>9782</code>.
<pre class="lang-bash">
$ kubectl -n rabbitmq-system port-forward deployment/rabbitmq-cluster-operator 9782
Forwarding from 127.0.0.1:9782 -> 9782
Forwarding from [::1]:9782 -> 9782
</pre>

In a separate terminal, you can now use <code>go tool pprof</code> to profile the Operator Pod. For example, to analyse
memory allocations in the Pod:

<pre class="lang-bash">
$ go tool pprof "localhost:9782/debug/pprof/heap"
Fetching profile over HTTP from http://localhost:9782/debug/pprof/heap
Saved profile in /home/pprof/pprof.manager.alloc_objects.alloc_space.inuse_objects.inuse_space.001.pb.gz
</pre>

This opens a browser window to visualise the memory allocations in the profile.
For more information on how to use pprof, see https://github.com/google/pprof/blob/main/doc/README.md

The profiles exposed by the Operators are listed below.

<table>
<thead>
  <tr>
    <th>Path<br></th>
    <th>Profile Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>/debug/pprof</td>
    <td>A list of all profiles available on the system</td>
  </tr>
  <tr>
    <td>/debug/pprof/allocs</td>
    <td>A sampling of all past memory allocations</td>
  </tr>
  <tr>
    <td>/debug/pprof/block</td>
    <td>Stack traces that led to blocking on synchronization primitives</td>
  </tr>
  <tr>
    <td>/debug/pprof/cmdline</td>
    <td>The command line invocation of the current program</td>
  </tr>
  <tr>
    <td>/debug/pprof/goroutine</td>
    <td>Stack traces of all current goroutines</td>
  </tr>
  <tr>
    <td>/debug/pprof/heap</td>
    <td>A sampling of memory allocations of live objects. You can specify the gc GET parameter to run GC before taking the heap sample, e.g. /debug/pprof/heap?gc=1</td>
  </tr>
  <tr>
    <td>/debug/pprof/mutex</td>
    <td>Stack traces of holders of contended mutexes</td>
  </tr>
  <tr>
    <td>/debug/pprof/profile</td>
    <td>CPU profile. You can specify the duration in the seconds GET parameter, e.g. /debug/pprof/profile?seconds=5</td>
  </tr>
  <tr>
    <td>/debug/pprof/threadcreate</td>
    <td>Stack traces that led to the creation of new OS threads</td>
  </tr>
  <tr>
    <td>/debug/pprof/trace</td>
    <td>A trace of execution of the current program. You can specify the duration in the seconds GET parameter, e.g. /debug/pprof/trace?seconds=5</td>
  </tr>
</tbody>
</table>
