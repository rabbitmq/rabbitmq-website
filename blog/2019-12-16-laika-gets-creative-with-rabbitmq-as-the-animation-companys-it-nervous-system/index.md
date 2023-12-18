---
title: "LAIKA Gets Creative with RabbitMQ As the Animation Company's IT Nervous System"
tags: ["Case Studies", ]
authors: [ddrewitz]
---

Based in Portland, Oregon, [LAIKA](https://www.laika.com/) is a premier stop-motion animation company. With award-winning films like *Coraline*, *ParaNorman*, *The BoxTrolls*, *Kubo and the Two Strings*, and most recently, *Missing Link*, LAIKA is recognized for its unique aesthetic. Producing films the way LAIKA does is at the intersection of high-tech and analog.

LAIKA's small IT team is passionate about the animation business. "We support the production, making the movie." explained Mahlon Smith, Senior Technologist at LAIKA. The team is behind the scenes, amongst set carpenters, painters, and film directors. "We enable the production as efficiently as possible. Every dollar saved is a dollar we can apply towards the screen."

This sense of fiscal responsibility steers the team towards reusable technologies. Particularly when it comes to integration. With that frugality in mind, the team began looking at RabbitMQ as far back as 2009. What they've learned from using RabbitMQ over the last six years is how to solve more with a flexible messaging backbone.

<!-- truncate -->

## Challenge: "Everything that happens is an event"

Operating IT for an animation company comes with some unique challenges. Cycling through film design, set production, and filming has artists coming and going. "Our industry historically has been a  nomadic population," explains Smith. For a company of its size, the volume of identity management activities was very high. 

Broadly speaking, LAIKA's IT team faces challenges that are ubiquitous today. "We have a variety of in-house and third party systems," said Smith. The number of environments that need to be integrated are ever growing. New software and systems are being introduced, while existing systems are rarely retired. 

Finally, there's an ever-present need to troubleshoot. Between network events, desktop support, to the render farms themselves, getting alerts and insights into activities is critical. As Will Fife, Senior Systems Administrator at LAIKA notes, "Increasingly, everything that happens has an event or does something because of an event." 

## RabbitMQ: "It's the nervous system of the company"

Faced with a dynamic user population, the IT team developed  a toolset to provision accounts across discrete systems. They adopted RabbitMQ, the most popular open source message broker to integrate between systems. For example, a new user needs a phone extension provisioned, but the standard LDAP identity doesn't have direct access to the phone system. Using RabbitMQ, a new user account creation event lands in a queue. The phone system listens to that queue and provisions an extension.  

"Our desktop support admins can create a new user account and we have some consistency and reliability in knowing that account is now pushed out to all the places it needs to be," explained Smith. The team is starting to use the [web socket layer for RabbitMQ](/docs/web-stomp) to send live updates to a browser. This empowers the desktop support team to see what's going on in real-time to troubleshoot user issues.

As LAIKA adds new software and systems, that event-driven approach to adding new users simplifies tedious processes. "Over time, we've added more and more listeners to the new user event that do additional tasks and additional things. It makes that more resilient," says Fife. 

RabbitMQ's ability to set policies stood out against other messaging tools like NATS or NSQ. For example, the team can use policies to make sure that private information stays on a very secure V-host with limited access.

RabbitMQ has become something of an IT Swiss Army knife for LAIKA. "We control most of our VMs on the network over AMQP," explains Fife. "This includes starting them, shutting them down, destroying them, creating them, creating storage for them." If a VM doesn't reboot in an expected amount of time, an app reading the RabbitMQ queue notifies the owner by chat.

While LAIKA does around 90% of it's internal coding in Ruby, the IT team appreciates that RabbitMQ itself is language agnostic. "The [STOMP layer that RabbitMQ provides](/docs/stomp) makes it so you can trivially participate in network events with just a raw socket," says Smith.

Because it's easy to extend and integrate with, RabbitMQ has become the go-to integration tool. "If we require any sort of communication between systems, that’s what we’re going to use," says Smith. "It’s the nervous system of our information technology environment."

## "We know we have a path to integrate"

Using RabbitMQ as the messaging backbone has reduced a lot of effort for the IT team. "From an IT perspective, once we had it deployed and our framework in place, now when we spin something up it’s almost zero effort," says Smith.

From new users to VM operations, IT has automated tasks and reduced the risk of error. A recent building move, for example, was simplified by adding listeners to an event queue to provision network ports. 

The eventing model of RabbitMQ means that the team doesn't have to hardcode integrations. "We can loosely couple things. We don't need concrete contracts between systems," says Smith.

The flexibility and support for policies keeps the LAIKA team coming back to RabbitMQ for more use cases. The more it integrates, the more useful it becomes to solving the next challenge.

"It's a component that now has so much stuff flowing through it, that's the first place we go when solving a problem because we know the information is on the wire there, or can be with minimal effort." says Smith. "We know that we have a path to integrate with that event stream when a new problem presents itself."

### Hear from more RabbitMQ users

* Bloomberg: [Growing a farm of rabbits to scale financial applications](https://content.pivotal.io/rabbitmq/keynote-growing-a-farm-of-rabbits-to-scale-financial-applications-will-hoy-david-liu)
* Goldman Sachs: [Scaling RabbitMQ](https://content.pivotal.io/rabbitmq/keynote-scaling-rabbitmq-at-goldman-sachs-jonathan-skrzypek)
* Softonic: [From a monolith architecture to microservices and event-based communication](https://www.cloudamqp.com/blog/2019-01-18-softonic-userstory-rabbitmq-eventbased-communication.html)
