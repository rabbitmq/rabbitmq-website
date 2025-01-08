---
title: Using Git and GitHub
---
<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Using Git and GitHub

This page describes the way we work with Git on the
RabbitMQ project.

## Overview {#overview}

Git is a fast, powerful distributed source control management system.
It has numerous [tutorials](https://git-scm.com/doc).

Team RabbitMQ uses Git to manage almost all of our source code.

RabbitMQ source code repositories are [hosted on GitHub](https://github.com/rabbitmq).
Individual project pages on this website will generally point
you in the direction of the specific combinations of modules
you'll need to check out.

This website is [open source and hosted on GitHub](https://github.com/rabbitmq/rabbitmq-website/)
as well.

## Branching policy: Branch per issue {#branch-per-bug}

RabbitMQ uses the technique of `branch per issue` when
developing RabbitMQ code, where each feature or bug fix is
developed on a branch of its own using

<code>git checkout -b</code>

and merged into the <code>main</code> or
<code>stable</code> branches only when it passes QA. Branches
follow the pattern <code><i>repository-name</i>-<i>NN</i></code>,
where <i>repository-name</i> is the name of the GitHub project
where the issue was filed (eg. <code>rabbitmq-dotnet-client</code>)
and <i>NN</i> is the GitHub issue number. The purpose of
prepending the repository owning the issue is that an issue
may require changes to several projects. There are also
branches named <code>bug<i>NNNNN</i></code> for issues in the
original Bugzilla tracker (which is not public).

## Pull Requests and the Review/QA Process {#pull-requests}

Branches that are ready to be reviewed and/or QA'ed should
be submitted as pull requests. Feedback is then given in
the comments. After receiving feedback, update the original
branch and push it: GitHub will take care of updating the pull
request. Then the process goes on until the pull request is
merged or closed (e.g. because a feature is rejected after an
attempt to implement it).

The pull request must be made against the <code>stable</code>
branch if it is a bugfix involving no incompatible changes
with the latest stable release (ie. no changes to the Mnesia
schema or the inter-node communication), or the <code>main</code>
branch for everything else.

## The main branch {#default-branch}

The default repository branch contains all the work that
has been QA'd so far that is scheduled to appear in the next
feature release.

Generally, you can track QA'd development work by tracking the
main (default) branches of the RabbitMQ repositories
of interest.

Pull requests that are meant to ship in currently maintained release series,
for example, 3.11.x, are backported to release series-specific
branches.

## Release series branches {#release-branches}

There is also a separate branch for every release series that is currently
maintained. These branches are named after the series: <code>v3.13.x</code>, <code>v3.12.x</code>,
and so on.

It plays the same role as the <code>main</code> branch except that it carries merged,
QA'd code intended for the next bug-fix release rather than
the next general release.

Pull requests that are meant to ship in currently maintained release series are backported
to these branches after being merged into the `main` branch. In the process they are
labelled with `backport-v3.13.x`, `backport-v3.12.x`, and similar labels
on GitHub.

For example, if a pull request is labelled with `backport-v3.12.x`, it means that it was
backported, or at least considered for backporting, to the `v3.12.x` branch to ship
in a 3.12.x release.

## Tags {#tags}

Team RabbitMQ uses tags in the git repository to give names to snapshots of the state of
the code: mostly importantly, releases. Generally, both the core repositories and the
repositories of plugins intended to work with the named
snapshot are tagged.

For example, if you are using RabbitMQ server version 3.12.7,
then examining the output of <code>git tag</code> yields:

```bash
git tag
# omitted for brevity
# => v3.13.0
# => v3.12.13
# => v3.12.12
```

```bash
git checkout v3.13.0
```

At this point, you could proceed with compiling the plugin
as explained in the plugin's documentation.
