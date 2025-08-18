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
              <section>
                <Heading as="h2">Community</Heading>
                <p>RabbitMQ is an open-source project with an active community of fellow users and contributors. Community support is available on a best-effort basis through the following channels:</p>
                <p>
                  <Link to="https://github.com/rabbitmq/rabbitmq-server/discussions">GitHub</Link> |&nbsp;
                  <Link to="https://www.rabbitmq.com/discord">Discord</Link> |&nbsp;
                  <Link to="https://groups.google.com/forum/#!forum/rabbitmq-users">Mailing List</Link> |&nbsp;
                  <Link to="https://web.libera.chat/">IRC</Link>
                </p>
              </section>
            </div>
          </div>
        </div>

        <div id="tanzu-rabbitmq" className={styles.license}>
          <div className={styles.container}>
            <Heading as="h1">VMware Tanzu RabbitMQ</Heading>
            <Heading as="h4">Commercial RabbitMQ includes both 24/7 support and features not available in the open source version.</Heading>

            <Tabs>
              <TabItem value="feature-1" label="Enterprise Support" default>
                <Heading as="h2">Around the clock, around the globe support</Heading>
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h4">Support from Core Engineers</Heading>
                    <p>As the owner of RabbitMQ, VMware Tanzu employs the core engineering team. You get support from the people who build and maintain RabbitMQ — ensuring expert guidance and faster resolution of critical issues.</p>
                  </section>
                  <section>
                    <Heading as="h4">Severity driven SLAs</Heading>
                    <p>Highest severity issues receive attention within 30 minutes, 24/7/365.</p>
                  </section>
                  <section>
                    <Heading as="h4">Longer Support Timelines</Heading>
                    <p>Extended support lifecycle with critical patches and CVE fixes for multiple versions. While open source users must stay current, enterprise customers can upgrade on their own schedule.</p>
                  </section>
                  <section>
                    <Heading as="h4">Contribute to the Product Roadmap</Heading>
                    <p>As an enterprise user, you have direct access to the RabbitMQ product team. You can contribute to the roadmap of RabbitMQ.</p>
                  </section>
                  <section>
                    <Heading as="h4">VMware vSphere</Heading>
                    <p>
                     We provide commercial support for running RabbitMQ on a variety of platforms. In addition, VMware Tanzu RabbitMQ provides an OVA battle-tested for enterprises running <a href="https://www.vmware.com/docs/vmw-tanzu-rabbitmq-ova-and-vsphere-vmotion">RabbitMQ on vSphere</a>.
                    </p>
                  </section>
                </div>
              </TabItem>
              <TabItem value="feature-2" label="Enterprise Features">
                <Heading as="h2">Exclusive capabilities supporting your mission-critical apps</Heading>
                <div className={styles.flex_columns}>
                  <section>
                    <Heading as="h4">Multi-Data Center Disaster Recovery</Heading>
                    <p>Efficient schema and data replication to a second data center supporting promotion of that second site in the event of a disaster.</p>
                  </section>
                  <section>
                    <Heading as="h4">Enterprise Security</Heading>
                    <p>Advanced security including FIPS 140-2 compliance leveraging OpenSSL3, forward proxy support through OAuth 2.0, and scanning of RabbitMQ and its dependencies for CVEs.</p>
                  </section>
                  <section>
                    <Heading as="h4">Intra-Cluster Compression</Heading>
                    <p>In a heavily loaded system with high traffic between RabbitMQ nodes, compression can reduce the network load by up to 96%, depending on the nature of the workload.</p>
                  </section>
                  <section>
                    <Heading as="h4">AMQP 1.0 over WebSocket</Heading>
                    <p>
                     Browser-based applications can communicate with RabbitMQ using AMQP 1.0, making it a practical choice for web-based business applications.
                    </p>
                  </section>
                  <section>
                    <Heading as="h4">Audit Logging</Heading>
                    <p>
                     VMware Tanzu RabbitMQ on Kubernetes supports audit-logging. Relevant audit events, for example, which user deleted a queue, are collected and logged separately.
                    </p>
                  </section>
                </div>
              </TabItem>
            </Tabs>
            <Heading as="h4">Talk to our RabbitMQ experts: <Link to="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</Link>
</Heading>
            <Link className="button button--primary" to="mailto:contact-tanzu-data.pdl@broadcom.com">Email Us</Link>
          </div>
        </div>

        <div className={styles.featured_partner}>
          <div className={styles.container}>
            <Heading as="h1"><span className={styles.highlight_text}>Partner Spotlight: Announcing AceMQ, our RabbitMQ MSP Partner</span></Heading>
            <Heading as="h1"><span className={styles.highlight_text}>AceMQ <small>is our featured authorized partner providing End-to-End RabbitMQ solutions, including: white-glove commercial support and expert services for Tanzu RabbitMQ & RabbitMQ Community Edition. </small></span></Heading>
            <p><strong className={styles.highlight_text}>To learn more about AceMQ’s RabbitMQ support, managed services, and RabbitMQ consulting & training offerings, please get in touch below: </strong></p>
            <div>
              <Link className="button button--primary" to="https://acemq.com/rabbitmq/" rel="noopener">Consulting</Link>&nbsp;
              <Link className="button button--primary" to="https://acemq.com/rabbitmq/licensing/" rel="noopener">Commercial Support</Link>
            </div>
          </div>
        </div>

        <div id="consulting" className={styles.partners}>
          <div className={styles.container}>
            <Heading as="h1">Consulting & Training Partners</Heading>
            <Heading as="h4">VMware Tanzu’s trusted partners are here to help you in your local market and provide high touch professional services.</Heading>
            <div>
              <Link className="button button--secondary" to="#AMER">Americas</Link>&nbsp;
              <Link className="button button--secondary" to="#APac">Asia Pacific</Link>&nbsp;
              <Link className="button button--secondary" to="#EMEA">EMEA</Link>
            </div>
            <br></br>
            <Heading id="AMER" as="h2">Americas</Heading>
            <div className={styles.partner}>
              <Heading as="h3">AceMQ</Heading>
              <p className={styles.partner_region}>Offices in: 🇺🇸USA &mdash; Supporting organizations worldwide</p>
              <p>AceMQ is a premier Global RabbitMQ partner offering comprehensive support, training, and consulting services for both RabbitMQ Community Edition and RabbitMQ for Tanzu. As Broadcom’s authorized licensing partner for RabbitMQ, we enable organizations to secure annual or subscription-based licenses under a flexible model, tailored for long-term scalability and compliance.</p>
              <p>With deep experience in deploying and managing RabbitMQ across cloud, on-premises, hybrid, and Kubernetes environments, AceMQ delivers unmatched expertise in architecture design, high-availability clustering, security hardening, and performance optimization. Our team of RabbitMQ specialists empowers businesses across industries—including finance, healthcare, defense, logistics, and SaaS—to build reliable, scalable messaging infrastructure aligned to mission-critical demands.</p>
              <p>Whether you're seeking deployment support, upgrade planning, incident resolution, or help transitioning to licensed RabbitMQ, AceMQ ensures your systems operate with maximum resilience and efficiency. From initial assessments to long-term partnerships, we offer flexible engagement models and global coverage.</p>
              <Heading as="h4">Our services include:</Heading>
              <ul>
                <li>RabbitMQ Licensing &mdash; Official RabbitMQ for Tanzu and Community Edition licensing partner with tailored MSA terms</li>
                <li>Architecture & Performance Assessments &mdash; In-depth reviews for security, scalability, and reliability</li>
                <li>24x7 Global Support &mdash; SLA-driven emergency response from senior RabbitMQ experts, with up to guaranteed 15-minute response for critical issueseed, reliability, and scalability</li>
                <li>Migrations & Upgrades &mdash; Seamless transitions across versions and environments, including high-availability clustering</li>
                <li>Training & Mentorship &mdash; Hands-on coaching, workshops, and personalized enablement for technical teams</li>
                <li>Optimization & Scaling &mdash; Advanced tuning for throughput, message durability, and resource efficiency</li>
              </ul>
              <div>
                <Link to="https://acemq.com/rabbitmq/" rel="noopener">Learn More</Link> |&nbsp;
                <Link to="https://acemq.com/contact-us/" rel="noopener">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">Carahsoft</Heading>
              <p className={styles.partner_region}>Offices in: 🇺🇸USA &mdash; Serving public sector & other highly regulated industries in Canada & USA</p>
              <p>Carahsoft Technology Corp. is The Trusted Public Sector IT Solutions Provider, supporting US Federal, State and Local Government agencies, Education institutes, Healthcare providers, as well as the Canada Public Sector. Carahsoft partners with thousands of vendors, resellers, system integrators and MSPs to proactively market, sell, and deploy a comprehensive range of IT solutions. Carahsoft can leverage these partnerships to connect your organization with the right team for RabbitMQ projects, ensuring you receive the expertise and support for your project’s success.</p>
              <ul>
                <li>Assist with procurement and contract management for RabbitMQ</li>
                <li>Connect customers to RabbitMQ solution providers specializing in public sector use cases across the United States and Canada</li>
                <li>Provide support to assist government, education, and healthcare sectors with RabbitMQ design, deployments, and implementations</li>
                <li>Help organizations implement and scale RabbitMQ solutions effectively within required regulatory frameworks.</li>
              </ul>
              <div>
                <Link to="https://www.carahsoft.com/vendors/vmware/technical-support/tanzu-rabbitmq">Learn More</Link> |&nbsp;
                <Link to="https://www.carahsoft.com/vendors/vmware/technical-support/tanzu-rabbitmq">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">TeraSky</Heading>
              <p className={styles.partner_region}>Offices in: 🇺🇸USA, 🇮🇱Israel, 🇱🇹Lithuania, 🇬🇧United Kingdom &mdash; Serving North America, South America, and Central Europe</p>
              <p>As a trusted VMware partner, TeraSky specializes in delivering end-to-end RabbitMQ solutions, both on-premises and in the cloud. From architecture design and deployment to comprehensive training and long-term support, we ensure enterprises seamlessly integrate RabbitMQ into mission-critical environments. Our goal is to drive scalability, resilience, and optimal performance. We combine deep technical expertise and flawless execution to solve complex technology challenges with precision, merging enterprise-grade infrastructure with cloud-native agility for maximum impact.</p>
              <Heading as="h4">TeraSky RabbitMQ Services:</Heading>
              <ul>
                <li>Global Presence — All Americas and EMEA - worldwide support.</li>
                <li>Architecture & Assessments — In-depth design, security, and performance evaluations tailored to optimize RabbitMQ deployments.</li>
                <li>Migrations & Upgrades — Smooth transitions from legacy systems to the latest RabbitMQ versions, ensuring minimal downtime.</li>
                <li>24/7 Managed Services — Ongoing monitoring, expert support, and SLA-backed issue resolution to maintain peak performance.</li>
                <li>Performance Optimization — Tuning RabbitMQ for high throughput, low latency, and scalability across diverse environments.</li>
                <li>Training & Mentorship — Hands-on workshops and tailored enablement for development and operations teams, ensuring teams are fully equipped to leverage RabbitMQ’s full potential.</li>
                <li>Cloud-Native Integration — Full-spectrum RabbitMQ solutions across on-premises, hybrid, and cloud environments, ensuring seamless operations regardless of deployment model.</li>
              </ul>
              <div>
                <Link to="https://www.terasky.com/partners/vmware/">Learn More</Link> |&nbsp;
                <Link to="https://www.terasky.com/contact/">Get In Touch</Link>
              </div>
            </div>
            <Heading id="APac" as="h2">Asia Pacific</Heading>
            <div className={styles.partner}>
              <Heading as="h3">FiQir Holdings Sdn Bhd</Heading>
              <p className={styles.partner_region}>Offices in: 🇲🇾Malaysia, 🇳🇿New Zealand &mdash; Serving Asia Pacific</p>
              <p>FiQir Holdings is a trusted technology solutions provider specializing in RabbitMQ consulting, integration, and support. With deep expertise in distributed systems and cloud-native architectures, we help organizations build scalable, high-performance messaging infrastructures that drive operational efficiency and business growth. Our team of specialists ensures seamless deployment, optimization, and ongoing support to keep your RabbitMQ environment running reliably and securely.</p>
              <ul>
                <li>RabbitMQ Consulting & Architecture – Expert guidance on designing and optimizing messaging systems for high availability and resilience.</li>
                <li>Deployment & Integration – Seamless RabbitMQ deployments tailored to your cloud or on-premise environment.</li>
                <li>Performance Tuning & Optimization – Enhancing system throughput, reducing latency, and ensuring optimal scalability.</li>
                <li>Training & Mentorship – Hands-on coaching to empower your teams with best practices in RabbitMQ management.</li>
                <li>24/7 Support & Maintenance – Proactive monitoring, troubleshooting, and expert assistance to minimize downtime.</li>
              </ul>
              <div>
                <Link to="https://fiqirs.com/integration.html">Learn More</Link> |&nbsp;
                <Link to="https://fiqirs.com/index.html#contact">Get In Touch</Link>
              </div>
            </div>
            <Heading id="EMEA" as="h2">EMEA</Heading>
            <div className={styles.partner}>
              <Heading as="h3">coders51</Heading>
              <p className={styles.partner_region}>Offices in: 🇮🇹Italy</p>
              <p>At coders51, we provide end-to-end RabbitMQ solutions. As members and founding sponsors of the Erlang Ecosystem Foundation, our deep expertise in Erlang gives us thorough understanding of RabbitMQ's internals - a technology we consider essential for distributed systems. We support companies across the complete RabbitMQ lifecycle: from queue architecture design and resilient client implementation to cluster maintenance and incident management, ensuring optimal system reliability and performance.</p>
              <ul>
                <li>Design, develop and scale software platforms</li>
                <li>From legacy software to Cloud Native and Microservices</li>
                <li>RabbitMQ consultancy, support, and maintenance</li>
                <li>Training</li>
              </ul>
              <div>
                <Link to="https://www.coders51.com/">Learn More</Link> |&nbsp;
                <Link to="https://www.coders51.com/#contact-cta">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">Databorn</Heading>
              <p className={styles.partner_region}>Offices in: 🇦🇪UAE &mdash; Serving Central Asia & Africa</p>
              <p>Databorn is a trusted Tanzu IT consulting partner and reseller, offering data-driven solutions for businesses across the banking, insurance, telco and retail sectors in the Middle East & Africa, Eastern Europe, and Central Asia. Our expertise extends to RabbitMQ, helping enterprises build reliable, scalable, and high-performance messaging architectures.</p>
              <ul>
                <li>Expert consulting on RabbitMQ design, deployment, and best practices</li>
                <li>Seamless integration and support for optimized messaging workflows</li>
                <li>Performance optimization to enhance throughput, reliability, and scalability</li>
              </ul>
              <div>
                <Link to="https://databorn.ai/data">Learn More</Link> |&nbsp;
                <Link to="https://databorn.ai/contact">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">evoila</Heading>
              <p className={styles.partner_region}>Offices in: 🇩🇪Germany, 🇮🇹Italy, 🇱🇺Luxembourg, 🇦🇹Austria, 🇨🇭Switzerland, 🇭🇷Croatia, 🇸🇰Slovakia, 🇵🇱Poland, 🇧🇦Bosnia and Herzegovina &mdash; Serving EMEA</p>
              <p>Evoila is a leading consultancy specializing in RabbitMQ, both Open Source and Tanzu. With deep expertise in architecture, deployment, and operations, we help organizations design scalable, resilient, and high-performing messaging solutions. Our team provides hands-on support for complex integrations, performance tuning, and best practices for event-driven architectures. From initial setup to 24/7 managed services, we ensure your RabbitMQ environment runs efficiently and reliably. Our Services:</p>
              <ul>
                <li>Architecture & Assessments</li>
                <li>24/7 Managed Services</li>
                <li>Deployments & Operations</li>
                <li>Migrations & Upgrades</li>
                <li>Performance Optimization</li>
              </ul>
              <div>
                <Link to="https://evoila.com/de/loesungen/big-data/rabbitmq/">Learn More</Link> |&nbsp;
                <Link to="https://evoila.com/de/loesungen/big-data/rabbitmq/#contact">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">TeraSky</Heading>
              <p className={styles.partner_region}>Offices in: 🇮🇱Israel, 🇱🇹Lithuania, 🇬🇧United Kingdom, 🇺🇸USA &mdash; Serving Central Europe, North America, and South America</p>
              <p>As a trusted VMware partner, TeraSky specializes in delivering end-to-end RabbitMQ solutions, both on-premises and in the cloud. From architecture design and deployment to comprehensive training and long-term support, we ensure enterprises seamlessly integrate RabbitMQ into mission-critical environments. Our goal is to drive scalability, resilience, and optimal performance. We combine deep technical expertise and flawless execution to solve complex technology challenges with precision, merging enterprise-grade infrastructure with cloud-native agility for maximum impact.</p>
              <Heading as="h4">TeraSky RabbitMQ Services:</Heading>
              <ul>
                <li>Global Presence — All Americas and EMEA - worldwide support.</li>
                <li>Architecture & Assessments — In-depth design, security, and performance evaluations tailored to optimize RabbitMQ deployments.</li>
                <li>Migrations & Upgrades — Smooth transitions from legacy systems to the latest RabbitMQ versions, ensuring minimal downtime.</li>
                <li>24/7 Managed Services — Ongoing monitoring, expert support, and SLA-backed issue resolution to maintain peak performance.</li>
                <li>Performance Optimization — Tuning RabbitMQ for high throughput, low latency, and scalability across diverse environments.</li>
                <li>Training & Mentorship — Hands-on workshops and tailored enablement for development and operations teams, ensuring teams are fully equipped to leverage RabbitMQ’s full potential.</li>
                <li>Cloud-Native Integration — Full-spectrum RabbitMQ solutions across on-premises, hybrid, and cloud environments, ensuring seamless operations regardless of deployment model.</li>
              </ul>
              <div>
                <Link to="https://www.terasky.com/partners/vmware/">Learn More</Link> |&nbsp;
                <Link to="https://www.terasky.com/contact/">Get In Touch</Link>
              </div>
            </div>
            <div className={styles.partner}>
              <Heading as="h3">VLDB</Heading>
              <p className={styles.partner_region}>Offices in: 🇬🇧United Kingdom &mdash; Serving organizations worldwide</p>
              <p>At VLDB Solutions, we specialise in comprehensive managed services for Tanzu RabbitMQ, ensuring your messaging infrastructure is optimised, secure, and scalable—wherever your business operates. From initial strategy and deployment to continuous monitoring and optimisation, we manage the complexities across multiple regions, allowing your organisation to focus on growth. With 24/7 support, deep RabbitMQ expertise, and tailored solutions, we empower businesses worldwide to maintain high-performance communication systems.</p>
              <Heading as="h4">What Sets VLDB Solutions Apart?</Heading>
              <ul>
                <li>Global Coverage & Expertise &mdash; We support businesses across multiple geographies, providing expert RabbitMQ solutions worldwide.</li>
                <li>Performance & Scalability Optimisation &mdash; Advanced configurations to boost throughput, reduce latency, and scale messaging workloads efficiently.</li>
                <li>Seamless Integration & Customisation &mdash; Tailored RabbitMQ deployments to fit your business needs, ensuring smooth integration with databases, cloud services, and microservices architectures.</li>
                <li>Proactive Monitoring & Incident Prevention &mdash; Real-time analytics and predictive monitoring prevent issues before they impact operations.</li>
                <li>Enterprise-Level Support & Security &mdash; We ensure compliance, security, and resilience for businesses in highly regulated industries.</li>
              </ul>
              <div>
                <Link to="https://vldbsolutions.com/services/support/tanzu-rabbitmq/">Learn More</Link> |&nbsp;
                <Link to="https://vldbsolutions.com/contact/">Get In Touch</Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </Layout>
  );
}
