# Website

## Workflow

### Branches

The `main` branch is the production branch. Commits to it are deployed
automatically to www.rabbitmq.com by a Cloulflare worker.

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

```
npm install
```

You need to de this once only.

### Local Development

The following command starts a local development server and opens up a browser
window. Most changes are reflected live without having to restart the server.

```
npm start
```

### Build

The following command generates static content into the `build` directory and
can be served using any static contents hosting service.

```
npm run build
```

This is important to run this command before pushing changes to GitHub to make
sure the build is successful. This is the command that will be used to deploy
the website in production.
