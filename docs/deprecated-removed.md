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

# Deprecated and Removed Features

If a feature is deprecated, it means its capability will be removed in a future RabbitMQ release. It is recommended to discontinue using this feature. Review the following list of deprecated features, check which ones you are using,for those features you are using, complete the required next steps to use a replacement if one exists or other required actions. 

A removed feature is one that was previously available but is now removed.

## <a id="deprecate-classiqueuemirror" class="anchor" href="#deprecate-deprecated-classiqueuemirror">Classic Queue Mirroring</a>

### Description

Quorum Queues provide greater data safety compared to classic mirrored queues, which is why mirroring (queue contents replication) of classic queues is deprecated and will be removed in a future release. 

<table class="deprecated-removed" title="Classic Queue Mirroring Deprecation and Removal Dates and Releases">
  <tr>
    <th>Can Use it by Default Until</th>
    <th>Cannot Use it by Default In</th>
    <th>Replacement</th>
    <th>Removed In</th>
  </tr>

  <tr>
    <td>2023-12-31 in Releases 3.11.15 -> 3.12.8</td>
    <td>2024-01-14 in Releases 3.13 onwards</td>
    <td>Quorum Queues, go to Next Steps</td>
    <td>Q1 2024</td>
  </tr>
</table>

### Next Steps

1. ....
2. ....

