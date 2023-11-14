---
title: Deprecated and Removed Features
---
<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# Deprecated Features

If a feature is deprecated, it means its capability will be removed in a future RabbitMQ release. It is recommended to discontinue using this feature, you should take actions now to use an alternative instead. 

Layout: Option 1: 

## <a id="deprecate-classiqueuemirror" class="anchor" href="#deprecate-deprecated-classiqueuemirror">Classic Queue Mirroring</a>

<table class="Deprecated Features ">
  <tr>
    <th>Deprecated Feature</th>
    <th>Deprecated in Release</th>
    <th>Description</th>
    <th>Action to Take</th>
  </tr>

  <tr>
    <td>Classic Queue Mirroring</td>
    <td>3.12</td>
    <td>Quorum Queues provide greater data safety compared to classic mirrored queues, which is why mirroring (queue contents replication) of classic queues is being deprecated in RabbitMQ release X.X.</td>
    <td>Quorum queues and/or streams should be used instead of mirrored classic queues.</td>
  </tr>
</table>

Layout: Option 2:

## <a id="deprecate-classiqueuemirror" class="anchor" href="#deprecate-deprecated-classiqueuemirror">Classic Queue Mirroring</a>

### Description

Quorum Queues provide greater data safety compared to classic mirrored queues, which is why mirroring (queue contents replication) of classic queues is deprecated.

### What Release is it Deprecated 

3.12

### Actions to Take

1. ....



## <a id="removed-fewversions" class="anchor" href="#removed-fewversuibs">Removed Features</a>

The following features that were available in previous releases are now removed from RabbitMQ.

<table class="Removed Features ">
  <tr>
    <th>Removed Feature</th>
    <th>Removed in Release</th>
    <th>Description</th>
    <th>Action to Take</th>
  </tr>

  <tr>
    <td>Classic Queue Mirroring</td>
    <td>4.0</td>
    <td>Quorum Queues provide greater data safety compared to classic mirrored queues, which is why mirroring (queue contents replication) of classic queues is being removed in RabbitMQ release 4.0</td>
    <td>Quorum queues and/or streams should be used instead of mirrored classic queues.</td>
  </tr>
</table>


