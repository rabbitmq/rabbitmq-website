# Agent Instructions

## Introduction

This is a documentation website for [RabbitMQ](https://rabbitmq.com/docs). It has multiple
editions (documented release series):

 * 4.2 (in development): its Markdown source files can be found under `./docs`
 * 4.1 with source files under `./versioned_docs/verion-4.1`
 * 4.0 with source files under `./versioned_docs/verion-4.0`
 * 3.13 with source files under `./versioned_docs/verion-3.13`

Some part of the site are not versioned (only have one edition):

 * Six or seven tutorials for multiple programming languages under `./tutorials`
 * Client library documentation under `./client-libraries`
 * Kubernetes Cluster Operators documentation under `./kubernetes`
 * Blog under `./blogs`
 * Other pages that are not version-specific under `src/pages`

Other source code elements (React/Docusaurus components, stylesheets) can be found under `src/components`, `src/css`, `src/plugins`.

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

## Conventions

 * Prefer Markdown to HTML
 * Never translate Markdown tables to HTML or vice versa
 * Run a full build in development mode (`npm run docusaurus '--' build '--dev'`) when asked to sanity check the result

## Commit Messages

 * Never inject co-author or any other agent/vendor/LLM-specific details into commit messages

## Code Examples that Use CLI Tools

 * When analyzing or creating examples that use `rabbitmqctl`, consult `rabbitmqctl help`
 * When analyzing or creating examples that use `rabbitmqctl`, consult `rabbitmqctl help`
 * When analyzing or creating examples that use `rabbitmqadmin`, consult `rabbitmqadmin help`

## Dependency Updates

 * When updating, adding or removing dependencies, make sure to update `package-lock.json`
