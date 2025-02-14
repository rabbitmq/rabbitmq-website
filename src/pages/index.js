import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Mermaid from '@theme/Mermaid';

import styles from './index.module.css';
import OSIKeyholeIcon from './assets/OSI_Keyhole.min.svg';
import CommercialSupportIcon from './assets/commercial-support-icon.svg';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={`RabbitMQ: ${siteConfig.tagline}`}>
      <main>
        <div className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div>
              <Heading as="h1">RabbitMQ</Heading>
              <p className={styles.tagline}>{siteConfig.tagline}</p>
            </div>
            <div class={styles.heroCta}>
              <Link className="button button--primary" to="/tutorials">Getting Started</Link>
              <Link className={styles.release_notes_link} to="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.6">RabbitMQ 4.0.6</Link>
            </div>
          </div>
        </div>

        <div className={styles.why}>
          <div className={styles.container}>
            <Heading as="h1">Why RabbitMQ?</Heading>
            <p>RabbitMQ is a reliable and mature messaging and streaming
              broker, which is easy to deploy on cloud environments,
              on-premises, and on your local machine. It is currently used by
              millions worldwide.</p>
            <div className={styles.flex_columns}>
              <section>
                <Heading as="h2">Interoperable</Heading>
                <p>RabbitMQ <Link to="/docs/protocols">supports several open
                  standard protocols</Link>, including AMQP 1.0 and MQTT 5.0.
                  There are multiple client libraries available, which can be
                  used with your programming language of choice, just pick one.
                  No vendor lock-in!</p>
              </section>
              <section>
                <Heading as="h2">Flexible</Heading>
                <p>RabbitMQ provides many options you can combine to define how
                  your messages go from the publisher to one or many consumers. <Link
                    to="/tutorials/tutorial-four-python">Routing</Link>, <Link
                    to="/tutorials/amqp-concepts#exchange-topic">filtering</Link>, <Link
                    to="/docs/streams">streaming</Link>, <Link
                    to="/docs/federation">federation</Link>, and so on, you name it.</p>
              </section>
              <section>
                <Heading as="h2">Reliable</Heading>
                <p>With the ability to <Link to="/docs/reliability">acknowledge
                  message delivery</Link> and to <Link to="/docs/quorum-queues">
                  replicate messages across a cluster</Link>, you can ensure
                  your messages are safe with RabbitMQ.</p>
              </section>
            </div>
          </div>
        </div>

        <div className={styles.usecases_heading}>
          <div className={styles.container}>
            <Heading as="h1">Examples of common use cases</Heading>
            <p>Here are a few common use cases we hear about from the community
              or our customers. This should help you better understand what
              RabbitMQ is and how it can help.</p>
           </div>
        </div>
        <div className={styles.usecases}>
          <div className={styles.container}>
            <Tabs>
              <TabItem value="usecase-1" label="Decoupling services" default>
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h2">Decoupling interconnected services</Heading>
                    <p>You have a backend service that needs to send
                      notifications to end users. There are two notification
                      channels: emails and push notifications for the mobile
                      application.</p>
                    <p>The backend publishes the notification to two queues,
                      one for each channel. Programs that manage emails and
                      push notification subscribe to the queue they are
                      interested in and handle notifications as soon as they
                      arrive.</p>
                    <p><strong>➡ Benefits</strong></p>
                    <ul>
                      <li>RabbitMQ absorbs the load spike.</li>
                      <li>You can do some maintenance on the notification
                        managers without interrupting the whole service.</li>
                    </ul>
                  </section>
                  <section>
                    <Mermaid
                      value={`
flowchart TD
    B([Backend])
    Q1[[Email]]
    Q2[[Push]]
    E([Email sender])
    P([Push notification sender])

    B --> Q1 --> E
    B --> Q2 --> P

    class B mermaid-producer
    class Q1 mermaid-queue
    class Q2 mermaid-queue
    class E mermaid-consumer
    class P mermaid-consumer
`}
                      />
                  </section>
                </div>
              </TabItem>
              <TabItem value="usecase-2" label="RPC">
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h2">Remote Procedure Call</Heading>
                    <p>You own a concert hall. Tickets for the shows are sold
                      on multiple websites and physical kiosks. Orders from all
                      channels must go through a complex process to determine
                      if a customer effectively get their tickets, depending on
                      availability. The website or kiosk expect to get an
                      answer for the order in minimal time.</p>
                    <p>Orders are published to a queue in RabbitMQ with a
                      correlation ID. The caller that pushed the order then
                      subscribes to another queue and waits for an answer with
                      that same correlation ID.</p>
                    <p>To achieve low latency,
                      a <Link to="/docs/classic-queues">classic queue</Link> is
                      a good fit here but it is at the expense of less safety —
                      the caller can still retry. If the order cannot be lost,
                      you might prefer to use a combination of <Link
                      to="/docs/confirms">acknowledgments</Link> and <Link
                      to="/docs/quorum-queues">quorum queues</Link> to ensure
                      a message is safe once confirmed.</p>
                    <p>This topology allows the processing of orders to be
                      serialized to serve them in a first come first served
                      order. This avoids the need for transactions.</p>
                    <p><strong>➡ Benefits</strong></p>
                    <ul>
                      <li>A RabbitMQ client can be a publisher and a consumer
                        at the same time.</li>
                      <li>RabbitMQ can be used to <Link
                        to="/tutorials/tutorial-six-python">dispatch RPC
                        calls</Link>.</li>
                    </ul>
                  </section>
                  <section>
                    <Mermaid
                      value={`
flowchart TD
    W([Website])
    K([Kiosk])
    O[[Orders]]
    C[[Confirmations]]
    B[[Ticket management]]

    W --> O
    K --> O
    O --> B
    C --- B
    W --- C
    K --- C

    class W mermaid-producer
    class K mermaid-producer
    class O mermaid-queue
    class C mermaid-queue
    class B mermaid-consumer
`}
                    />
                  </section>
                </div>
              </TabItem>
              <TabItem value="usecase-3" label="Streaming">
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h2">Streaming</Heading>
                    <p>You run a video platform. When a user uploads a new
                      video, you have multiple tasks to complete when the video
                      is safely stored: run some post-upload analysis,
                      transcode lower quality copies of the video, notify other
                      users subscribed to the author's creations, and so
                      on.</p>
                    <p>The upload service appends “New video” events to a
                      RabbitMQ stream. Multiple backend applications can
                      subscribe to that stream and read new events
                      independently of each other. Users must be notified right
                      away, but the post-upload analysis can wait and run once
                      a day.</p>
                    <p><strong>➡ Benefits</strong></p>
                    <ul>
                      <li><Link to="/docs/streams">Streams</Link> are very
                        efficient and avoids the need to duplicate
                        messages.</li>
                      <li>A consumers can go back and forth in the stream even
                        if there are concurrent consumers.</li>
                    </ul>
                  </section>
                  <section>
                    <Mermaid
                      value={`
flowchart TD
    U([Upload])
    S[[New video]]
    A([Analysis])
    N([Notifications])
    T([Transcoder])

    U --> S
    S --> A
    S --> N
    S --> T

    class U mermaid-producer
    class S mermaid-queue
    class A mermaid-consumer
    class N mermaid-consumer
    class T mermaid-consumer
`}
                    />
                  </section>
                </div>
              </TabItem>
              <TabItem value="usecase-4" label="IoT">
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h2">IoT</Heading>
                    <p>You provide package delivery services across the entire
                      galaxy. You have a swarm of space drones that need to
                      report their status on a regular basis to a server hosted
                      on exoplanet <em>Kepler-438 b</em>. Unfortunately, the
                      network connectivity is not great…</p>
                    <p>Each space drone runs a local RabbitMQ standalone node
                      that buffers their report until a connection is possible
                      with the upstream RabbitMQ.</p>
                    <p>When planets are aligned, the drone's RabbitMQ shovels
                      all reports to the upstream RabbitMQ.</p>
                    <p><strong>➡ Benefits</strong></p>
                    <ul>
                      <li>RabbitMQ deployments can be chained to cater for
                        different needs in your service, using features such
                        as <Link to="/docs/shovel">shovels</Link> and <Link
                        to="/docs/federation">federation</Link>.</li>
                      <li><Link to="/docs/mqtt">MQTT</Link> is well suited for
                        millions of concurrent connections.</li>
                    </ul>
                  </section>
                  <section>
                    <Mermaid
                      value={`
flowchart TD
    D1([Drone 1])
    D2([Drone 2])
    D3([Drone 39234])
    LR1[[Local RabbitMQ]]
    LR2[[Local RabbitMQ]]
    LR3[[Local RabbitMQ]]
    UR[[Upstream RabbitMQ]]
    RH([Report handler])

    D1 --> LR1
    D2 --> LR2
    D3 --> LR3
    LR1 -.-> UR
    LR2 -.-> UR
    LR3 -.-> UR
    UR --> RH

    class D1 mermaid-producer
    class D2 mermaid-producer
    class D3 mermaid-producer
    class LR1 mermaid-queue
    class LR2 mermaid-queue
    class LR3 mermaid-queue
    class UR mermaid-queue
    class RH mermaid-consumer
`}
                    />
                  </section>
                </div>
              </TabItem>
            </Tabs>
          </div>
        </div>

        <div className={styles.license}>
          <div className={styles.container}>
            <Heading as="h1">What about the license?</Heading>
            <p>Since its original release in 2007, RabbitMQ is Free and Open
              Source Software. In addition, Broadcom offer a range of
              commercial offerings.</p>
            <div className={styles.flex_columns}>
              <section>
                <OSIKeyholeIcon/>
                <Heading as="h2">Free and Open Source</Heading>
                <p>RabbitMQ is dual-licensed under the Apache License 2.0 and
                  the Mozilla Public License 2. You have the freedom to use and
                  modify RabbitMQ however you want.</p>
                <p>Of course, contributions are more than welcome! Whether it
                  is through bug reports, patches, helping someone,
                  documentation or any form of advocacy. In fact contributing
                  is the best way to support the project!
                  Take a look at our <Link
                  to="/github">Contributors page</Link>.</p>
              </section>
              <section>
                <CommercialSupportIcon/>
                <Heading as="h2">Commercial offerings</Heading>
                <p>Broadcom offers <Link
                  to="https://tanzu.vmware.com/rabbitmq/oss">enterprise-grade
                  24/7 support</Link> where you have access to the engineers
                  making the product.</p>
                <p>In addition, a range of commercial offerings for RabbitMQ
                  are available. These commercial offerings include all of the
                  features of RabbitMQ, with some additional management and
                  advanced features like <Link
                  to="https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/standby-replication.html">warm
                  standby replication</Link> and <Link
                  to="https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/clustering-compression-rabbitmq.html">intra-cluster
                  data compression</Link>. These features are a must for
                  heavy workloads.</p>
                <p>For a list of the commercial offerings, take a look at
                  the <Link to="https://tanzu.vmware.com/rabbitmq">Ways to run
                  Tanzu RabbitMQ and Free and Open Source RabbitMQ
                  distributions table</Link>.</p>
              </section>
            </div>
          </div>
        </div>

        <div className={styles.testimonies}>
          <div className={styles.container}>
            <Heading as="h1">What are users saying?</Heading>
            <p>RabbitMQ is used by millions around the world. Here is what
              some of our users are saying about it!</p>
            <div className={styles.flex_columns}>
              <section className={styles.blockquote}>
                <blockquote>RabbitMQ is the one message broker that HASN'T given
                  me grief in my career.</blockquote>
                <p className={styles.attribution}>&mdash;&nbsp;<Link to="https://news.ycombinator.com/item?id=23269692"><em>codeduck</em> on Hacker News</Link></p>
              </section>
              <section className={styles.blockquote}>
                <blockquote>I've been running RabbitMQ for &gt;8 years in
                production, once even in a fleet of 180 buses where every bus
                had an instance of rabbitmq running locally. Never had a single
                issue in all those years.</blockquote>
                <p className={styles.attribution}>&mdash;&nbsp;<Link to="https://news.ycombinator.com/item?id=23261707"><em>gog</em> on Hacker News</Link></p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
