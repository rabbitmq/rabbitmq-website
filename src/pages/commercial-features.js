import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import SupportTimelines from '@site/src/components/SupportTimelines';

import styles from './index.module.css';

const features = [
  {
    feature: <>Dependencies validated, <strong>security scanned</strong>, and included, as well as security fixes for base OS supplied</>,
    benefit: 'Reduced cost of installing, upgrading, and testing dependencies. Reduced risk profile as OS security vulnerabilities are also supplied.'
  },
  {
    feature: <><strong>Multi-site replication</strong>: assisted deployment and configuration of passive sites</>,
    benefit: 'Reduced cost of deploying and configuring RabbitMQ clusters.'
  },
  {
    feature: <>Multi-site replication with dynamic adaptation to wide area network latency and semi-automated <strong>promotion on failover</strong></>,
    benefit: 'Reduced costs of designing and configuring disaster recovery topology; reduced recovery point objective, recovery time objective, and overall risk.'
  },
  {
    feature: <>Lightweight, efficient & universal <strong>web app development</strong> & deployment</>,
    benefit: 'AMQP 1.0 over websockets simplifies the use of the more flexible & feature rich protocol.'
  },
  {
    feature: <>Reduced <strong>network utilization</strong> between RabbitMQ nodes</>,
    benefit: 'Reduced cost of data ingress/egress between availability zones(especially, when running in a public cloud). Reduced risk of network saturation.'
  },
  {
    feature: <>Delegated <strong>authentication</strong> and <strong>TLS certificates</strong> from <strong>Hashicorp Vault</strong></>,
    benefit: 'Reduced cost of configuring integration and maintenance. Reduced security risks by using a single source of truth.'
  },
  {
    feature: <><strong>Enhanced encryption</strong>: non-safe variants of TLS disabled by default</>,
    benefit: 'Reduced security risk out of the box, as well as cost of disabling manually for every deployment.'
  },
  {
    feature: <>Enhanced encryption: <strong>automated mutual TLS</strong> setup between RabbitMQ nodes</>,
    benefit: 'Reduced cost of manually configuring each deployment. Reduced risk of man-in-the-middle attacks.'
  },
  {
    feature: <>Easy Federal Information Processing Standards (<strong>FIPS</strong>) compliance</>,
    benefit: 'Specific FIPS builds of Tanzu RabbitMQ'
  }
]

export default function CommercialFeatures() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={`RabbitMQ: ${siteConfig.tagline}`}>
      <main>
        <div className={[styles.hero, styles.commercial_features_hero].join(" ")}>
          <div className={[styles.container, styles.heroInner].join(" ")}>
            <Heading as="h1">Commerial Features</Heading>
            <div className={styles.commercial_features_cta}>
              <Link
                className="button button--primary"
                to="mailto:contact-tanzu-data.pdl@broadcom.com"
              >
                Contact Us
              </Link>
              &nbsp;
              <Link className="button button--primary" to="/contact#consulting">
                Find a Partner
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.container}>
            <Heading as="h1">VMware Tanzu RabbitMQ</Heading>
            <p>
              VMware Tanzu RabbitMQ, a commercial edition of RabbitMQ, includes features and
              support beyond the open source edition:
            </p>
            <div className={styles.services_row}>
              <div className={styles.services_col}>
                <img src="/img/illu-streaminlined-deployment-and-management.webp" />
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Longer Support Timelines</Heading>
                <p>
                  Extended support lifecycle with critical patches and CVE fixes
                  for more release series.
                </p>
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Support from Core Engineers</Heading>
                <p>
                  24×7 support from the team that builds and maintains RabbitMQ
                </p>
              </div>
              <div className={styles.services_col}>
                <img src="/img/bc-vmw-illu-productivity-computer-drkbg.webp" />
              </div>
              <div className={styles.services_col}>
                <img src="/img/illu-enhanced-developer-experience.webp" />
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Enterprise Security</Heading>
                <p>
                  Advanced security including FIPS 140-2 compliance for TLS,
                  forward proxy support for OAuth 2.0, and
                  continuous CVE scanning of both RabbitMQ and its dependencies.
                </p>
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Disaster Recovery Features</Heading>
                <p>
                  Continuous efficient schema and data replication to standby clusters in external data centers.
                  In case of a disaster event, a standby cluster can be quickly promoted to a primary one.
                </p>
              </div>
              <div className={styles.services_col}>
                <img src="/img/illu-robust-security-and-compilance-for-admins.webp" />
              </div>
              <div className={styles.services_col}>
                <img src="/img/bc-vmw-illu-dev-cost-of-migration-drkbg.webp" />
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">AMQP 1.0 Over WebSockets</Heading>
                <p>
                  Browser-based applications can communicate with RabbitMQ using
                  AMQP 1.0 over WebSocket connections.
                </p>
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Intra-Cluster Traffic Compression</Heading>
                <p>
                  In a heavily loaded system with high traffic between RabbitMQ
                  nodes, compression can reduce the network load by up to 96%,
                  depending on the nature of the workload.
                </p>
              </div>
              <div className={styles.services_col}>
                <img src="/img/bc-vmw-illu-productivity-computer-drkbg.webp" />
              </div>
              <div className={styles.services_col}></div>
              <div className={styles.services_col}>
                <Heading as="h3">Audit Logging</Heading>
                <p>
                  VMware Tanzu RabbitMQ on Kubernetes supports audit logging.
                  Internal events, for example, which user deleted a
                  queue, are collected and logged separately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section} id="comparison">
          <div className={styles.container}>
            <Heading as="h1">Tanzu RabbitMQ vs Open Source</Heading>
            <table className={styles.comparison_table}>
              <thead>
                <tr>
                  <th className={styles.text_left}>Features</th>
                  <th>Open Source RabbitMQ</th>
                  <th>Tanzu RabbitMQ</th>
                  <th className={styles.text_left}>Benefits</th>
                </tr>
              </thead>
              <tbody>
                {features.map(({feature, benefit}) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td className={styles.unsupported}>❌</td>
                    <td className={styles.supported}>✅</td>
                    <td>{benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.container}>
            <Heading as="h1">Support Timelines</Heading>
            <SupportTimelines />
            <br />
            <div>
              <Link
                className="button button--primary"
                to="mailto:contact-tanzu-data.pdl@broadcom.com"
              >
                Contact Us
              </Link>
              &nbsp;
              <Link className="button button--primary" to="/contact#consulting">
                Find a Partner
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
