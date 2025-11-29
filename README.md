# Website

This repository contains the source code of the RabbitMQ website, rabbitmq.com.
**Please make sure to read the Workflow section before contributing**.

### Before You Start: Please Sign Our Contributor CLA

If this is your first contribution to RabbitMQ and it involves more than a typo fix,
please [sign our contributor CLA](https://github.com/rabbitmq/cla).

The process involves one email and one online signature using a legally binding digital signature service.

Sorry about this annoyance and thank you!

## ContributionWorkflow

### TL;DR

This repository contains documentation guides for multiple RabbitMQ release series.
At the moment they are `4.3.x` (in development), `4.2.x`, `4.1.x`, `4.0.x`, and `3.13.x`.

Therefore, the very first question to consder before making any changes is:
what editions (versions) does my change apply to? Should I update just the next release edition,
all `4.x` ones or even `3.13.x`?

Here is a summary of which version of the documentation corresponds to which
branch and directory:

| Version of RabbitMQ | Branch | Sub-directory | Served at |
|---------------------|--------|---------------|-----------|
| Development version (4.3) | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `docs` | [`www.rabbitmq.com/docs/next`](https://www.rabbitmq.com/docs/next) |
| 4.2 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-4.2` | [`www.rabbitmq.com/docs`](https://www.rabbitmq.com/docs) |
| 4.1 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-4.1` | [`www.rabbitmq.com/docs/4.1`](https://www.rabbitmq.com/docs/4.1) |
| 4.0 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-4.0` | [`www.rabbitmq.com/docs/4.0`](https://www.rabbitmq.com/docs/4.0) |
| 3.13 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-3.13` | [`www.rabbitmq.com/docs/3.13`](https://www.rabbitmq.com/docs/3.13) |
| 3.12 | [`v3.12.x`](https://github.com/rabbitmq/rabbitmq-website/tree/v3.12.x) | root | (no longer available) |

### Branches and Versioning

The `main` branch is the production branch. Commits to it are deployed
automatically to www.rabbitmq.com.

All editions (versions) of the docs live side by side in the `main` branch.

Docusaurus uses the following directories:

* `docs` contains the docs of the future version of RabbitMQ, thus it is the
  work in progress. It is served at [rabbitmq.com/docs/next](https://www.rabbitmq.com/docs/next)
* `versioned_docs` contains one directory per version; for example,
  `versioned_docs/version-4.1`. The latest version is served at
  [rabbitmq.com/docs](https://www.rabbitmq.com/docs). Older versions are served at
  `…/docs/$version`, for example [rabbitmq.com/docs/3.13](https://www.rabbitmq.com/docs/3.13).

Changes should be made to `docs` and to any version they apply. Here is an
example:

```
# Make changes to the future version’s docs.
$EDITOR docs/configure.md

# Test the change in a browser.
npm start

# Once happy, apply to the relevant older release series
cd versioned_docs/version-4.0
git diff ../../docs | patch -p2

# Test again in a browser.
npm start

# Commit everything.
git add docs versioned_docs
git commit
```

Please read the [documentation on versioning in Docusaurus](https://docusaurus.io/docs/versioning) to learn more.

Older versions of the docs that we don’t want to host in Docusaurus to limit
the number of versions are put in branches of the form `v3.13.x`, `v4.0.x`,
etc. These branches are deployed automatically too and they use domain names of
the form `v3-13.rabbitmq.com`, `v4-0.rabbitmq.com`, etc. respectively. Note
that these branches used as examples may not exist yet if the corresponding
docs are still maintained in the `main` branch.

### How to Build the Site

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern
static website generator.

#### Dependency Installation

You need to install JS components used by Docusaurus first with `yarn` or `npm`.
The examples below use `npm`.

``` shell
# for NPM users
npm install
```

You need to do this once only.

### Local Development

The following command starts a local development server and opens up a default browser
window. Most changes are reflected live without having to restart the server.

``` shell
npm start
```

To use a different browser, for example, Brave Beta, set the `BROWSER` env variable
when running `npm start`:

``` shell
BROWSER="Brave Beta" npm start
```

### Build

The following command generates static content into the `build` directory and
can be served using any static contents hosting service.

``` shell
npm run docusaurus '--' build '--dev'
```

This is important to run this command before pushing changes to GitHub to make
sure the build is successful. This is the command that will be used to deploy
the website in production.

## How to Add a New Version Series

When a new version series comes out, a separate edition of the docs must
be explicitly added using

```shell
# adds a series for 4.3.x
npm run docusaurus docs:version 4.3
```


## Copyright and License

© 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to
Broadcom Inc. and/or its subsidiaries.

<img align="right" width="180" src="http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.eu.svg">

The RabbitMQ documentation is dual-licensed under the Apache License 2.0 and
the Mozilla Public License 2.0. Users can choose any of these licenses
according to their needs. However, **the blog is excluded from this license and
remains the intellectual property of Broadcom Inc.** Blog posts may not be
restributed.

### SPDX

SPDX-License-Identifier: Apache-2.0 OR MPL-2.0
