---
title: "Package Repository Updates"
tags: ["announcements", "packages"]
authors: [mklishin]
---

Team RabbitMQ has two updates related to our Debian and RPM repositories:

1. On August 18, 2024, Team RabbitMQ's PackageCloud account will be discontinued
2. Cloudsmith mirror repositories now use `*.rabbitmq.com` domains, please update your repository definition files

<!-- truncate -->

## Mirrors Now Use `*.rabbitmq.com` Domains

The docs were updated to use `*.rabbitmq.com` for mirror subdomains, please update your repository files. 
The previously used domain names won't go away, however,
this migration would make your setup more future-proof for large infrastructure changes our team expects
to happen in the rest of 2024.

See [Debian](https://www.rabbitmq.com/docs/install-debian) and [RPM](https://www.rabbitmq.com/docs/install-rpm) installation guides.

## PackageCloud Will Be Discontinued on Aug 18th, 2024

PackageCloud, a great package distribution service we've been using since 2016 IIRC, will be discontinued on Aug 18, 2024.
This means that our PackageCloud repositories will become unavailable shortly after. 

Please move to the mirrors used in [Debian](https://www.rabbitmq.com/docs/install-debian) and [RPM](https://www.rabbitmq.com/docs/install-rpm)
installation guides **as soon as possible**!

On behalf of the RabbitMQ Core Team I would like to thank the PackageCloud team for providing us
with a solid service over the last eight years, during which we only have experienced one minor outage.

This migration has nothing to do with the quality of the service but rather reflects the fact that the core team is
in a different corporate environment today compared to 2016-2023, plus we now have our own
mirrors for backup.
