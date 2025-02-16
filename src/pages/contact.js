import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Mermaid from '@theme/Mermaid';

import styles from './index.module.css';

export default function Support() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={`RabbitMQ: ${siteConfig.tagline}`}>
      <main>
        <div className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div>
              <Heading as="h1">Support</Heading>
            </div>
          </div>
        </div>

        <div className={styles.supporttypes}>
          <div className={styles.container}>
            <div className={styles.flex_columns}>
              <section>
                <Heading as="h2">Community</Heading>
                  <p>Open source RabbitMQ is supported by the community. Follow the links below for your channel of preference to engage:</p>
                  <p>
                    <Link to="https://github.com/rabbitmq/rabbitmq-server/discussions">GitHub Discussions</Link> |&nbsp;
                    <Link to="https://www.rabbitmq.com/discord">Discord</Link> |&nbsp;
                    <Link to="https://groups.google.com/forum/#!forum/rabbitmq-users">Mailing List</Link> |&nbsp;
                    <Link to="https://web.libera.chat/">IRC</Link>
                  </p>
              </section>
              <section>
                <Heading as="h2">Commercial</Heading>
                <p>Tanzu RabbitMQ is developed by VMware Tanzu, which provides exclusive enterprise features and commercial support. This includes 24/7  experts with defined SLAs and longer term support for the latest versions.</p>
                <p>
                  <a href="#tanzu-rabbitmq" class="anchor">Learn More</a> |&nbsp;
                  <a href="mailto:contact-tanzu-data.pdl@broadcom.com">Contact VMware Tanzu</a>
                </p>
              </section>
              <section>
                <Heading as="h2">Consulting & Training</Heading>
                <p>Engage with our partners who have localized expertise and specialize in tailoring RabbitMQ solutions to the specific needs of your organization.</p>
                <p>
                  <a href="#consulting">Learn More</a>
                </p>
              </section>
            </div>
          </div>
        </div>

        <div id="tanzu-rabbitmq" className={styles.license}>
          <div className={styles.container}>
            <Heading as="h1">VMware Tanzu RabbitMQ</Heading>
            <Heading as="h4">Commercial RabbitMQ includes both 24/7 support and enterprise features not included in the open source version</Heading>

            <Tabs>
              <TabItem value="feature-1" label="Enterprise Support" default>
                <Heading as="h2">Around the clock, around the globe support</Heading>
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h4">Severity driven SLAs</Heading>
                    <p>Our SLAs ensure that each issue or help request raised is given priority attention. Highest severity issues will receive attention within 30 minutes.</p>
                  </section>
                  <section>
                    <Heading as="h4">Longer support timelines</Heading>
                    <p>Get patches and support for the latest versions for far longer than what is provided to open source users. Enterprises can take their time to upgrade at their own pace.</p>
                  </section>
                  <section>
                    <Heading as="h4">Access to RabbitMQ developers</Heading>
                    <p>Being the stewards of RabbitMQ, our support staff have direct access to the developers of RabbitMQ for expert advice and expedient patches where necessary.</p>
                  </section>
                </div>
              </TabItem>
              <TabItem value="feature-2" label="Advanced Enterprise Features">
                <Heading as="h2">Exclusive capabilities supporting your mission-critical apps</Heading>
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h4">Multi-data center disaster recovery</Heading>
                    <p>Seamless schema and data replication to a second data center that enables promotion of a second site in the event of a disaster.</p>
                  </section>
                  <section>
                    <Heading as="h4">Enterprise security</Heading>
                    <p>Enhanced encryption, delegated authentication using OAuth, and TLS certificates from Hashicorp Vault</p>
                  </section>
                  <section>
                    <Heading as="h4">Kubernetes deployments</Heading>
                    <p>Fully automated Kubernetes (K8s) operator and Helmchart that allows for seamless deployment into your K8s ecosystem.</p>
                  </section>
                  <section>
                    <Heading as="h4">Audit Features</Heading>
                    <p>
                    Collection and storage of internal cluster events as structured data (JSON) or in human readable form.
                    Cluster events relevant for audit, for example, what user deleted a queue or stream, are collected separately from the rest.
                    </p>
                  </section>
                </div>
              </TabItem>
            </Tabs>
            <Heading as="h4">Learn more by talking to an expert at Tanzu <Link to="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</Link>
</Heading>
            <Link className="button button--primary" to="mailto:contact-tanzu-data.pdl@broadcom.com">Email Us</Link>
          </div>
        </div>
        <div id="consulting" className={styles.partners}>
          <div className={styles.container}>
            <Heading as="h1">Consulting & Training Partners</Heading>
            <Heading as="h4">VMware Tanzu’s trusted partners are here to help you in your local market and provide high touch professional services.</Heading>
            <hr></hr>
            <Heading as="h2">AceMQ</Heading>
            <p>AceMQ is a trusted RabbitMQ partner, providing expert training, mentoring, and support for both RabbitMQ Community Edition and RabbitMQ for Tanzu. We have extensive experience deploying RabbitMQ in the cloud and Kubernetes, ensuring scalability, resilience, and optimal performance. Our team specializes in architecture, performance tuning, scaling, and integration to help organizations optimize their messaging systems. Whether you need deployment assistance, an in-depth assessment, or long-term support, we ensure your RabbitMQ environment runs efficiently and reliably.</p>
            <ul>
              <li>Based in US</li>
              <li>RabbitMQ Assessments &mdash; Architecture, security, and performance reviews</li>
              <li>24x7 Support &mdash; Dedicated SMEs, SLAs, and critical issue resolution</li>
              <li>Migrations & Upgrades &mdash; Seamless transitions and version upgrades</li>
              <li>Performance Optimization &mdash; Tuning for speed, reliability, and scalability</li>
              <li>Training & Mentorship &mdash; Hands-on coaching and expert guidance</li>
            </ul>
            <p>
              <Link to="https://acemq.com/mq-services/">Learn More</Link> |&nbsp;
              <Link to="https://acemq.com/contact-us/">Get In Touch</Link>
            </p>
            <hr></hr>
            <Heading as="h2">coders51</Heading>
            <p>At coders51, we provide end-to-end RabbitMQ solutions. As members and founding sponsors of the Erlang Ecosystem Foundation, our deep expertise in Erlang gives us thorough understanding of RabbitMQ's internals - a technology we consider essential for distributed systems. We support companies across the complete RabbitMQ lifecycle: from queue architecture design and resilient client implementation to cluster maintenance and incident management, ensuring optimal system reliability and performance.
</p>
            <ul>
              <li>Based in Italy</li>
              <li>Design, develop and scale software platforms</li>
              <li>From legacy software to Cloud Native and Microservices</li>
              <li>RabbitMQ consultancy, support, and maintenance</li>
              <li>Training</li>
            </ul>
            <p>
              <Link to="https://www.coders51.com/">Learn More</Link> |&nbsp;
              <Link to="https://www.coders51.com/#contact-cta">Get In Touch</Link>
            </p>
            <hr></hr>
            <Heading as="h2">VLDB</Heading>
            <p>At VLDB Solutions, we specialise in comprehensive managed services for Tanzu RabbitMQ, ensuring your messaging infrastructure is optimised, secure, and scalable—wherever your business operates. From initial strategy and deployment to continuous monitoring and optimisation, we manage the complexities across multiple regions, allowing your organisation to focus on growth. With 24/7 support, deep RabbitMQ expertise, and tailored solutions, we empower businesses worldwide to maintain high-performance communication systems.</p>
            <ul>
              <li>Based in UK</li>
              <li>Global Coverage & Expertise &mdash; We support businesses across multiple geographies, providing expert RabbitMQ solutions worldwide.</li>
              <li>Performance & Scalability Optimisation &mdash; Advanced configurations to boost throughput, reduce latency, and scale messaging workloads efficiently.</li>
              <li>Seamless Integration & Customisation &mdash; Tailored RabbitMQ deployments to fit your business needs, ensuring smooth integration with databases, cloud services, and microservices architectures.</li>
              <li>Proactive Monitoring & Incident Prevention &mdash; Real-time analytics and predictive monitoring prevent issues before they impact operations.</li>
              <li>Enterprise-Level Support & Security &mdash; We ensure compliance, security, and resilience for businesses in highly regulated industries.</li>
            </ul>
            <p>
              <Link to="https://vldbsolutions.com/services/support/tanzu-rabbitmq/">Learn More</Link> |&nbsp;
              <Link to="https://vldbsolutions.com/contact/">Get In Touch</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}