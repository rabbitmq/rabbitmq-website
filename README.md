# Website

This repository contains the source code of the RabbitMQ website, rabbitmq.com.
**Please make sure to read the Workflow section before contributing**.

## Workflow

### TL;DR

This repository contains documentation guides for multiple RabbitMQ release series.
At the moment they are `4.1.x` (in development(, `4.0.x`, and `3.13.x`.

Therefore, the very first question to consder before making any changes is:
what versions does my change apply to? Should I update just the `4.1.x` version,
all `4.x` ones or even `3.13.x`?

Here is a summary of which version of the documentation corresponds to which
branch and directory:

| Version of RabbitMQ | Branch | Sub-directory | Served at |
|---------------------|--------|---------------|-----------|
| Development version (4.1) | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `docs` | [`www.rabbitmq.com/docs/next`](https://www.rabbitmq.com/docs/next) |
| 4.0 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-4.0` | [`www.rabbitmq.com/docs`](https://www.rabbitmq.com/docs) |
| 3.13 | [`main`](https://github.com/rabbitmq/rabbitmq-website/tree/main) | `versioned_docs/version-3.13` | [`www.rabbitmq.com/docs/3.13`](https://www.rabbitmq.com/docs/3.13) |
| 3.12 | [`v3.12.x`](https://github.com/rabbitmq/rabbitmq-website/tree/v3.12.x) | root | [`v3-12.rabbitmq.com`](https://v3-12.rabbitmq.com/documentation.html) |

### Branches and versioning

The `main` branch is the production branch. Commits to it are deployed
automatically to www.rabbitmq.com by a Cloudflare worker.

We keep several versions of the docs in the `main` branch. Docusaurus uses the
following directories:

* `docs` contains the docs of the future version of RabbitMQ, thus it is the
  work in progress. It is served at https://www.rabbitmq.com/docs/next.
* `versioned_docs` contains one directory per version; for example,
  `versioned_docs/version-4.0`. The latest version is served at
  https://www.rabbitmq.com/docs. Older versions are served at
  `…/docs/$version`.

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

Please read the [documentation of Versioning in Docusaurus](https://docusaurus.io/docs/versioning) to learn more.

Older versions of the docs that we don’t want to host in Docusaurus to limit
the number of versions are put in branches of the form `v3.13.x`, `v4.0.x`,
etc. These branches are deployed automatically too and they use domain names of
the form `v3-13.rabbitmq.com`, `v4-0.rabbitmq.com`, etc. respectively. Note
that these branches used as examples may not exist yet if the corresponding
docs are still maintained in the `main` branch.

`v3.12.x` is a bit special in the sense that it is using the old static website
generator. This one is deployed by GitHub Actions to a Cloudflare worker. It is
available at https://v3-12.rabbitmq.com.

### How to build

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern
static website generator.

#### Installation

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
npm run build
```

This is important to run this command before pushing changes to GitHub to make
sure the build is successful. This is the command that will be used to deploy
the website in production.

## Copyright and License

© 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to
Broadcom Inc. and/or its subsidiaries.

<img align="right" width="180" src="http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.eu.svg">

The RabbitMQ documentation is dual-licensed under the Apache License 2.0 and
the Mozilla Public License 2.0. Users can choose any of these licenses
according to their needs. However, **the blog is excluded from this license and
remains the intellectual property of Broadcom Inc.** Blog posts may not be
restributed.

SPDX-License-Identifier: Apache-2.0 OR MPL-2.0
