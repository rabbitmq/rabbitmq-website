---
title: "RabbitMQ on Heroku"
tags: ["Cloud", ]
authors: [alexis]
---

We are very pleased to announce the availability in beta
of [RabbitMQ as a Heroku
add-on](https://heroku.srs.rabbitmq.com/). With
our [RabbitMQ
service on CloudFoundry](http://blog.cloudfoundry.com/post/8713844574/rabbitmq-cloud-foundry-cloud-messaging-that-just-works), this extends our commitment to
supporting the community of cloud application developers.

We believe that cloud messaging is fundamental in two senses. First
as a core capability to build applications that scale to cloud use
cases  as explained in
our [blog
post](http://blog.cloudfoundry.com/post/8713844574/rabbitmq-cloud-foundry-cloud-messaging-that-just-works) launching RabbitMQ on CloudFoundry. And second, because
messaging can be extended to solve common problems like integration
and data push. For example: to connect traditional on-premise
applications with virtualized and cloud deployments.

<!-- truncate -->

## Why offer RabbitMQ as a service

As we talked to more and more customers about this, what stood out
was that people want more than "it just works". They
also want "it's just there". In other words people want
ubiquity, and convenience.

Thus it made sense for us to move beyond offering RabbitMQ as a
product that you install and manage for every application
instance. RabbitMQ is now also a platform service. That means it is
installed and operated by us to save you the overhead and worry of
managing all your Rabbits yourself.

## A big thank-you to Rapportive

We would like to take this opportunity to
thank [the excellent Rapportive
team](http://rapportive.com/), who have helped us roadtest RabbitMQ on Heroku.

[Sam Stokes](http://twitter.com/#!/samstokes), CTO of
Rapportive, has kindly provided us with the following testimonial:
"RabbitMQ has been instrumental in scaling Rapportive. We now
serve our users 65 million contact profiles per month."

He goes on to say: "RabbitMQ holds Rapportive together: it
delivers requests to our highly concurrent web-crawling engine,
routes log entries for analytics, and lets us perform long-running
operations without tying up our web servers. We ask it to juggle
billions of messages every month and it hasn't broken a sweat.  The
RabbitMQ Heroku addon has saved us the weeks of effort we'd have had
to spend maintaining a RabbitMQ instance. We've come to depend on
their responsive support and domain expertise; they've even given us
tips to improve our application code!"

We look forward to seeing Rapportive go from strength to strength.

## The first open cloud messaging service

RabbitMQ and the Rabbit service demonstrate the power of "open
PaaS" as described by VMware's CTO Steve Herrod in
a [blog
post](http://blogs.vmware.com/console/2010/05/google-and-vmwares-open-paas-strategy.html) last year. In the open PaaS, platform services, eg queues
and notifications, do not limit developers to just one cloud.

By offering the same RabbitMQ service on instances of CloudFoundry
as well as on Heroku, we provide developers with convenience via a
familiar programming model on multiple clouds. That delivers choice
because messaging is available in the same place a developer chooses
to deploy their application.

And because RabbitMQ is open source, developers can set up their own
messaging capability for testing, or on their own servers behind the
firewall. This delivers a complete, consistent and portable
deployment model.

## Getting started

Heroku applications that use RabbitMQ may be built on any language
supported on the Heroku
cloud. In [this
blog post](http://blog.heroku.com/archives/2011/8/31/rabbitmq_add_on_now_available_on_heroku/), Morten Bagai introduces the steps required to build a
first application. If you would like to try the add-on and are not
on the Heroku beta tester program please contact us.

And: if you are at Dreamforce this week, please go and talk to Jerry
Kuch in the Developer Zone, who can show you the service.

If you write a cool application, please tell us about it. We'll
maintain a list of examples to show case the service, [as we are
doing with CloudFoundry](http://rabbitmq.cloudfoundry.com/).
