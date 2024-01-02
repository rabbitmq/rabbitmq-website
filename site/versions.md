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

# Release Series

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide explains what release series of RabbitMQ are currently covered by
community or extended commercial support policies, which release series is coming next, and
what series are no longer supported.

For guidance on upgrades, see the [Upgrade](./upgrade.html) and
[Blue/Green Deployment Upgrade](./blue-green-upgrade.html) guides.

## <a id="currently-supported" class="anchor" href="#currently-supported">Currently Supported &product-name; Release Series</a>

<table class="release-series">
  <tr>
    <th>Version</th>
    <th>Latest Patch</th>
    <th>First Release</th>
    <th>End of Community Support<sup>1</sup></th>
    <th>End of Extended Commercial Support<sup>2</sup></th>
    <th>In service for</th>
  </tr>

  <tr>
    <td>3.12</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/&version-server-tag;" target="_blank" rel="noopener noreferrer">&version-server;</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.12.0" target="_blank" rel="noopener noreferrer">02 June 2023</a></td>
    <td>30 June 2024</td>
    <td>31 December 2024</td>
    <td>18 months</td>
  </tr>
</table>

## <a id="extended-support" class="anchor" href="#extended-support">&product-name; Release Series That are Only Covered by Extended Support</a>

<table class="release-series">
  <tr>
    <th>Version</th>
    <th>Latest Patch</th>
    <th>First Release</th>
    <th>End of Community Support<sup>1</sup></th>
    <th>End of Extended Commercial Support<sup>2</sup></th>
    <th>In service for</th>
  </tr>

  <tr>
    <td>3.11</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.11.28" target="_blank" rel="noopener noreferrer">3.11.28</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.11.0" target="_blank" rel="noopener noreferrer">28 September 2022</a></td>
    <td>31 December, 2023</td>
    <td>31 July, 2024</td>
    <td>22 months</td>
  </tr>
</table>


## <a id="terminology" class="anchor" href="#terminology">Definition of Community and Extended Commercial Support</a>

In January 2023, the term **general support** was replaced with **community support** to avoid confusion with
VMware [terminology related to support lifecycle policy](https://tanzu.vmware.com/support/lifecycle_policy).

<sup>1</sup> **Community Support** means patch releases are [produced regularly](./changelog.html) based on feedback from all users,
both community and those with a commercial license.

<sup>2</sup> **Extended Commercial Support** means patches are produced for security and high severity issues reported by users with a [commercial license](./contact.html#paid-support).


## <a id="" class="anchor" href="#next-release-series">Next Release Series</a>

[RabbitMQ 3.13](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.13.0-rc.3), the next release series, is expected to be released in early 2024.

## <a id="out-of-support" class="anchor" href="#out-of-support">Release Series That are Out of Support</a>

<table class="release-series">
  <tr>
    <th>Version</th>
    <th>Final Patch</th>
    <th>First Release</th>
    <th>End of Life</th>
    <th>In service for</th>
  </tr>

  <tr>
    <td>3.10</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.10.25" target="_blank" rel="noopener noreferrer">3.10.25</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.10.0" target="_blank" rel="noopener noreferrer">3 May 2022</a></td>
    <td>31 December, 2023</td>
    <td>19 months</td>
  </tr>

  <tr>
    <td>3.9</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.9.29" target="_blank" rel="noopener noreferrer">3.9.29</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.9.0" target="_blank" rel="noopener noreferrer">26 July 2021</a></td>
    <td>31 July, 2023</td>
    <td>24 months</td>
  </tr>

  <tr>
    <td>3.8</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.35" target="_blank" rel="noopener noreferrer">3.8.35</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0" target="_blank" rel="noopener noreferrer">1 October 2019</a></td>
    <td>31 July 2022</td>
    <td>34 months</td>
  </tr>

  <tr>
    <td>3.7</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.28" target="_blank" rel="noopener noreferrer">3.7.28</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.0" target="_blank" rel="noopener noreferrer">28 November 2017</a></td>
    <td>30 September 2020</td>
    <td>34 months</td>
  </tr>

  <tr>
    <td>3.6</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_6_16" target="_blank" rel="noopener noreferrer">3.6.16</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_6_0" target="_blank" rel="noopener noreferrer">22 December 2015</a></td>
    <td>31 May 2018</td>
    <td>29 months</td>
  </tr>

  <tr>
    <td>3.5</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_5_8" target="_blank" rel="noopener noreferrer">3.5.8</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_5_0" target="_blank" rel="noopener noreferrer">11 March 2015</a></td>
    <td>31 October 2016</td>
    <td>20 months</td>
  </tr>

  <tr>
    <td>3.4</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_4_4" target="_blank" rel="noopener noreferrer">3.4.4</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_4_0" target="_blank" rel="noopener noreferrer">21 October 2014</a></td>
    <td>31 October 2015</td>
    <td>12 months</td>
  </tr>

  <tr>
    <td>3.3</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_3_5" target="_blank" rel="noopener noreferrer">3.3.5</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_3_0" target="_blank" rel="noopener noreferrer">2 April 2014</a></td>
    <td>31 March 2015</td>
    <td>12 months</td>
  </tr>

  <tr>
    <td>3.2</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_2_4" target="_blank" rel="noopener noreferrer">3.2.4</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_2_0" target="_blank" rel="noopener noreferrer">23 October 2013</a></td>
    <td>31 October 2014</td>
    <td>12 months</td>
  </tr>

  <tr>
    <td>3.1</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_1_5" target="_blank" rel="noopener noreferrer">3.1.5</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_1_0" target="_blank" rel="noopener noreferrer">1 May 2013</a></td>
    <td>30 April 2014</td>
    <td>12 months</td>
  </tr>

  <tr>
    <td>3.0</td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_0_4" target="_blank" rel="noopener noreferrer">3.0.4</a></td>
    <td><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_0_0" target="_blank" rel="noopener noreferrer">19 November 2012</a></td>
    <td>30 November 2013</td>
    <td>12 months</td>
  </tr>
</table>

To learn more about individual releases, please see the [change log](./changelog.html).


## <a id="prior-to-v3x" class="anchor" href="#prior-to-v3x">Versions prior to v3.x</a>

RabbitMQ <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v2_0_0" target="_blank" rel="noopener noreferrer">v2.0.0</a> was released on 24 August 2010.
<br />It reached end of life on 31 December 2012 as <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v2_8_7" target="_blank" rel="noopener noreferrer">v2.8.7</a>.

RabbitMQ v1.0.0 was released on 1 July 2007.
<br />It reached end of life on 31 December 2010 as <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v1_8_1" target="_blank" rel="noopener noreferrer">v1.8.1</a>.
