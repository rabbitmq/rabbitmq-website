import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.tagline} — ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
      </main>
    </Layout>
  );
}
