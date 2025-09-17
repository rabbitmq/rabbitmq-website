import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { CommercialSupportTimelines } from '@site/src/components/CommercialSupportTimelines';

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
        <div className={styles.section}>
          <div className={styles.container}>
            <Heading as="h1">Support Timelines</Heading>
            <CommercialSupportTimelines />
          </div>
        </div>
      </main>
    </Layout>
  );
}
