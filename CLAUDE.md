# Agent Instructions

## Introduction

This is a documentation website for [RabbitMQ](https://rabbitmq.com/docs). It has multiple
editions (documented release series):

 * 4.2 (in development): its Markdown source files can be found under `./docs`
 * 4.1 with source files under `./versioned_docs/version-4.1`
 * 4.0 with source files under `./versioned_docs/version-4.0`
 * 3.13 with source files under `./versioned_docs/version-3.13`

Some part of the site are not versioned (only have one edition):

 * Six or seven tutorials for multiple programming languages under `./tutorials`
 * Client library documentation under `./client-libraries`
 * Kubernetes Cluster Operators documentation under `./kubernetes`
 * Various static assets under `./static`
 * Release series maintenance page under `./release-information`
 * Blog under `./blog`
 * The home page at `src/pages/index.js`
 * Other pages that are not version-specific under `src/pages`
 * Sidebar configurations for different editions (release series) under `./versioned_sidebars`
 * Algolia search and deployment-related files under `./infrastructure`
 * Ignore the `ci` directory

Other source code elements (React/Docusaurus components, stylesheets) can be found under `src/components`, `src/css`, `src/plugins`,
`src/rehype`.


## Multiple Editions

 * Many documentation guides are present in all editions
 * Every edition naturally has difference from others
 * When asked to apply a change present in one edition (e.g. ./docs) to another (say, ./versioned_docs/version-4.1),
   always preserve the structural and semantical differences between the guides

## Build System

 * This website uses Docusaurus
 * Build: `npm run docusaurus '--' build '`
 * Build in development mode (with more details): `npm run docusaurus '--' build '--dev'`
 * Clean: `npm run clean`
 * Start a development server: `npm start`, then consult `http://localhost:3000/docs`

## Domain Expertise Sources

 * Consult [RabbitMQ documentation](https://www.rabbitmq.com/docs) or this very website's source code
   for additional information on RabbitMQ, its features, configuration settings, best deployment practices,
   CLI tools, and more

## Conventions

 * When suggesting text edits, use concise, impersonal language
 * Prefer Markdown to HTML
 * Never translate Markdown tables to HTML or vice versa
 * Run a full build in development mode (covered above under "Build System") when asked to sanity check the result

## Commit Messages

 * Never inject co-author or any other agent/vendor/LLM-specific details into commit messages

## Code Examples that Use CLI Tools

 * When analyzing or creating examples that use `rabbitmqctl`, consult `rabbitmqctl help`
 * For `rabbitmq-diagnostics` examples, consult `rabbitmq-diagnostics help`
 * For `rabbitmq-plugins` examples, consult `rabbitmq-plugins help`
 * For `rabbitmq-queues` examples, consult `rabbitmq-queues help`
 * For `rabbitmqadmin` examples, consult `rabbitmqadmin help`

## Dependency Updates

 * When updating, adding or removing dependencies, make sure to update `package-lock.json`

## Security and Privacy

 * Never add any personal information, from PII to technical details such as current hostname, IP addresses,
   into any suggested edits or content
