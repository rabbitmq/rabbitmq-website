import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import styles from './index.module.css';

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
        <div className={styles.services}>
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
                  for multiple versions.
                </p>
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Support from Core Engineers</Heading>
                <p>
                  24×7 support from the people who build and maintain RabbitMQ
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
                <Heading as="h3">Multi-Data Center Disaster Recovery</Heading>
                <p>
                  Efficient schema and data replication to a second data center
                  supporting promotion of that second site in the event of a
                  disaster.
                </p>
              </div>
              <div className={styles.services_col}>
                <img src="/img/illu-robust-security-and-compilance-for-admins.webp" />
              </div>
              <div className={styles.services_col}>
                <img src="/img/bc-vmw-illu-dev-cost-of-migration-drkbg.webp" />
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">AMQP 1.0 over WebSocket</Heading>
                <p>
                  Browser-based applications can communicate with RabbitMQ using
                  AMQP 1.0, making it a practical choice for web-based business
                  applications.
                </p>
              </div>
              <div className={styles.services_col}>
                <Heading as="h3">Intra-Cluster Compression</Heading>
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
                  VMware Tanzu RabbitMQ on Kubernetes supports audit-logging.
                  Relevant audit events, for example, which user deleted a
                  queue, are collected and logged separately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
