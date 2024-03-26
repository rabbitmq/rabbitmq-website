# Website

## Workflow

### Branches

The `main` branch is the production branch. Commits to it are deployed
automatically to www.rabbitmq.com by a Cloudflare worker.

Older versions of the docs that we don’t want to host in Docusaurus to limit
the number of versions are put in branches of the form `v3.13.x`, `v4.0.x`,
etc. These branches are deployed automatically too and they use domain names of
the form `v3-13.rabbitmq.com`, `v4-0.rabbitmq.com`, etc. respectively.

`v3.12.x` is a bit special in the sense that it is using the old static website
generator. This one is deployed by GitHub Actions to a Cloudflare worker.

### How to build

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern
static website generator.

#### Installation

You need to install JS components used by Docusaurus first:

``` shell
npm install
```

You need to de this once only.

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

© 2007-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to
Broadcom Inc. and/or its subsidiaries.

<img align="right" width="180" src="http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.eu.svg">

The RabbitMQ documentation is dual-licensed under the Apache License 2.0 and
the Mozilla Public License 2.0. Users can choose any of these licenses
according to their needs. However, **the blog is excluded from this license and
remains the intellectual property of Broadcom Inc.** Blog posts may not be
restributed.

SPDX-License-Identifier: Apache-2.0 OR MPL-2.0
