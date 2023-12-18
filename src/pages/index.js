import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';

import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  const ufEmbeddedHub = `
<div id="UfEmbeddedHub1501190831892" class="hubs-embedded small-tiles" data-tile-count="3"></div>
<script>window._ufHubConfig = window._ufHubConfig || [];window._ufHubConfig.push({'containers':{'app':'#UfEmbeddedHub1501190831892'},'collection':'453624','openLink':function(url){window.open(url);},'lazyloader':{'itemDisplayLimit':3,'maxTilesPerRow':3,'maxItemsTotal':3},'tileSize':'small','enablePageTracking':false,'baseUrl':'https://content.pivotal.io/','filesUrl':'https://content.cdntwrk.com/','generatedAtUTC':'2017-07-27 21:26:47'});</script>
<script>(function(d,t,u){function load(){var s=d.createElement(t);s.src=u;d.body.appendChild(s);}if(window.addEventListener){window.addEventListener('load',load,false);}else if(window.attachEvent){window.attachEvent('onload',load);}else{window.onload=load;}}(document,'script','https://content.pivotal.io/hubsFront/embed_collection'));</script>
`;

  const brokenLinks = useBrokenLinks();
  brokenLinks.collectAnchor('features');
  brokenLinks.collectAnchor('getstarted');
  brokenLinks.collectAnchor('support');
  brokenLinks.collectAnchor('community');

  return (
    <Layout title={`${siteConfig.tagline}`}>
      <main>
        <div className={styles.heroBanner}>
          <div className={styles.container}>
            <div className={styles.hero_pipeline_webinar}>
              <div className={styles.container}>
                <div className={styles.hero_text}>
                  <h1>Quorum queues</h1>
                  <p>A webinar on high availability and data safety in messaging</p>
                  <p>
                    <a href="https://tanzu.vmware.com/content/webinars/jun-11-ha-and-data-safety-in-messaging-quorum-queues-in-rabbitmq?utm_campaign=Global_BT_Q221_RabbitMQ-Data-Safety-in-Messaging&amp;utm_source=rabbitmq&amp;utm_medium=website" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.intro}>
          <div className={styles.container}>
            <h1>RabbitMQ is the most widely deployed open source message broker.</h1>
            <p>
              With tens of thousands of users, RabbitMQ is one of the most popular open source message brokers. From <a href="https://www.youtube.com/watch?v=1qcTu2QUtrU">T-Mobile</a> to <a href="https://medium.com/@runtastic/messagebus-handling-dead-letters-in-rabbitmq-using-a-dead-letter-exchange-f070699b952b">Runtastic</a>, RabbitMQ is used worldwide at small startups and large enterprises.
            </p>
            <p>
              RabbitMQ is lightweight and easy to deploy on premises and in the cloud. It supports multiple messaging protocols and <a href="/docs/streams">streaming</a>. RabbitMQ can be deployed in distributed and federated configurations to meet high-scale, high-availability requirements.
            </p>
            <p>
              RabbitMQ runs on many operating systems and cloud environments, and provides a <a href="/docs/devtools">wide range of developer tools for most popular languages</a>.
            </p>
            <p>
              See how other people are using RabbitMQ:
            </p>
            <div dangerouslySetInnerHTML={{__html: ufEmbeddedHub}} />
            <p id='morelinkafterufembed'><a href='https://content.pivotal.io/rabbitmq'>More <span className={'arrow'}></span></a></p>
          </div>
        </div>

        <div className={styles.container}>
          <hr/>
        </div>

        <div id='features' className={styles.featuresSection}>
          <div className={styles.container}>
            <h1 className={styles.center}>OSS RabbitMQ Features</h1>
            <div className={styles.features}>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/messaging.svg" height="62" width="71" alt="Asynchronous Messaging" title="Asynchronous Messaging"/>
                  <h2>Asynchronous Messaging</h2>
                  <p>
                    Supports <a href="/docs/protocols">multiple messaging protocols</a>, <a href="/docs/tutorials/tutorial-two-python">message queuing</a>, <a href="/docs/reliability">delivery acknowledgement</a>, <a href="/docs/tutorials/tutorial-four-python">flexible routing to queues</a>, <a href="/docs/tutorials/amqp-concepts">multiple exchange type</a>.
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/monitor.svg" height="62" width="71" alt="Developer Experience" title="Developer Experience"/>
                  <h2>Developer Experience</h2>
                  <p>
                    Deploy with <a href="/docs/download">Kubernetes, BOSH, Chef, Docker and Puppet</a>. Develop cross-language messaging with favorite programming languages such as: Java, .NET, PHP, Python, JavaScript, Ruby, Go, <a href="/docs/devtools">and many others</a>.
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/network.svg" height="62" width="71" alt="Distributed Deployment" title="Distributed Deployment"/>
                  <h2>Distributed Deployment</h2>
                  <p>
                    Deploy as <a href="/docs/clustering">clusters</a> for high availability and throughput; <a href="/docs/federation">federate</a> across multiple availability zones and regions.
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/clouds.svg" height="62" width="71" alt="Enterprise &amp; Cloud Ready" title="Enterprise &amp; Cloud Ready"/>
                  <h2>Enterprise &amp; Cloud Ready</h2>
                  <p>
                    Pluggable <a href="/docs/authentication">authentication</a>, <a href="/docs/access-control">authorisation</a>, supports <a href="/docs/ssl">TLS</a> and <a href="/docs/ldap">LDAP</a>. Lightweight and easy to deploy in public and private clouds.
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/tools.svg" height="62" width="71" alt="Tools &amp; Plugins" title="Tools &amp; Plugins"/>
                  <h2>Tools &amp; Plugins</h2>
                  <p>
                    Diverse array of <a href="/docs/devtools">tools and plugins</a> supporting continuous integration, operational metrics, and integration to other enterprise systems. Flexible <a href="/docs/plugins">plug-in approach</a> for extending RabbitMQ functionality.
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/gauge.svg" height="62" width="71" alt="Management &amp; Monitoring" title="Management &amp; Monitoring"/>
                  <h2>Management &amp; Monitoring</h2>
                  <p>
                    HTTP-API, command line tool, and UI for <a href="/docs/management">managing and monitoring</a> RabbitMQ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.container}>
            <h1 className={styles.center}>Commercial RabbitMQ Features</h1>
            <div className={styles.features}>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/commercial/traffic-compression.svg" height="71" width="71" alt="Inter-node Traffic Compression" title="Inter-node Traffic Compression"/>
                  <h2>Intra-cluster Compression</h2>
                  <p>
                    All network traffic exchanged by nodes in a deployment is compressed by default. For JSON message payloads, bandwidth usage is reduced by 16x. <a href="https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/clustering-compression-rabbitmq.html">Learn more</a>
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/commercial/warm-standby.svg" height="71" width="71" alt="Warm Standby" title="Warm Standby"/>
                  <h2>Warm Standby Replication</h2>
                  <p>
                    VMware RabbitMQ supports continuous schema definition and message replication to a remote cluster, which makes it easy to run a standby cluster for disaster recovery. <a href="https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/standby-replication.html">Learn more</a>
                  </p>
                </div>
              </div>
              <div className={[styles.feature, styles.column, styles.onethird].join(' ')}>
                <div className={styles.inner}>
                  <img src="./img/commercial/support.svg" height="71" width="71" alt="24/7 Expert Support" title="24/7 Expert Support"/>
                  <h2>24/7 Expert Support</h2>
                  <p>
                    A license comes with phone and online global coverage support, gold star standards SLAs and extends the support lifecycle. <a href="https://tanzu.vmware.com/rabbitmq/oss">Learn more</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id='getstarted' className={[styles.getstarted, styles.center].join(' ')}>
          <div className={styles.container}>
            <h1>Get Started</h1>
            <div className={styles.columns}>
              <div className={[styles.column, styles.fifty].join(' ')}>
                <div className={styles.inner}>
                  <div className={styles.container}>
                    <a className={styles.btn} href="/docs/download">Download + Installation</a>
                    <p>Servers and clients for popular operating systems and languages</p>
                  </div>
                </div>
              </div>
              <div className={[styles.column, styles.fifty].join(' ')}>
                <div className={styles.inner}>
                  <div className={styles.container}>
                    <a className={[styles.btn, styles.orangebtn].join(' ')} href="/docs/tutorials">RabbitMQ Tutorials</a>
                    <p>Hands-on examples to get you started with RabbitMQ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id='support' className={styles.support}>
          <div className={styles.container}>
            <h1 className={styles.center}>RabbitMQ Commercial Services</h1>
            <div className={styles.columns}>
              <div className={[styles.column, styles.onequarter].join(' ')}>
                <div className={styles.commercialservicesillustration}></div>
              </div>
              <div className={[styles.column, styles.threequarters].join(' ')}>
                <img src="./img/commercial/distribution-phone.svg" height="111" width="88"/>
                <h2>Commercial Distribution</h2>
                <p>
                  VMware offers a <a href="https://tanzu.vmware.com/rabbitmq">range of commercial offerings for RabbitMQ</a>. This includes a distribution called <a href="https://network.pivotal.io/products/p-rabbitmq-for-kubernetes/info">VMware RabbitMQ</a> that deploys on Kubernetes or your container Runtime, as well as a version that deploys in <a href="https://tanzu.vmware.com/tanzu">VMware Tanzu Application Service</a>. These distributions include all of the features of the open source version, with some additional management and business continuity features. Support agreements are part of the commercial licensing.
                </p>
                <img src="./img/commercial/support-and-hosting-phone.svg" height="94" width="109"/>
                <h2>Support + Hosting</h2>
                <p>
                  VMware provides <a href="https://tanzu.vmware.com/rabbitmq/oss">support for open source RabbitMQ</a>, available for a subscription fee. The following companies provide technical support and/or cloud hosting of open source RabbitMQ: <a href="https://www.cloudamqp.com/">CloudAMQP</a>, <a href="https://aws.amazon.com/amazon-mq/">Amazon MQ for RabbitMQ</a>, <a href="https://www.erlang-solutions.com/products/rabbitmq.html">Erlang Solutions</a>, <a href="https://acemq.com/rabbitmq/">AceMQ</a>, <a href="http://www.visualintegrator.com/rmq/">Visual Integrator, Inc</a>, <a href="https://console.cloud.google.com/launcher/details/click-to-deploy-images/rabbitmq">Google Cloud Platform</a> and <a href="https://northflank.com/changelog/introducing-managed-rabbit-mq-build-and-scale-with-queues-and-message-brokers">Northflank</a>. RabbitMQ can also be deployed in AWS and Microsoft Azure.
                </p>
                <img src="./img/commercial/testing-phone.svg" height="109" width="94"/>
                <h2>Training</h2>
                <p>
                  The following companies provide free, virtual, or instructor-led courses for RabbitMQ: <a href="https://mylearn.vmware.com/mgrReg/courses.cfm?ui=www_edu&amp;a=one&amp;id_subject=94112" target="_blank" rel="noopener noreferrer">VMware</a>, <a href="https://www.erlang-solutions.com/products/rabbitmq.html">Erlang Solutions</a>, <a href="http://www.visualintegrator.com/rmq/" target="_blank" rel="noopener noreferrer">Visual Integrator, Inc</a> and <a href="https://www.learnquest.com/course-detail-v3.aspx?cnum=rabbitmq-e1xc" target="_blank" rel="noopener noreferrer">LearnQuest</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div id='community' className={styles.community}>
          <div className={styles.container}>
            <div className={[styles.column, styles.twothirds].join(' ')}>
              <div className={styles.inner}>
                <h1>Community</h1>
                <br/>
                <a className={[styles.btn, styles.orangebtn].join(' ')} href="https://groups.google.com/forum/#!forum/rabbitmq-users" target="_blank" rel="noopener noreferrer">Mailing List</a>
                <a className={styles.btn} href="https://www.rabbitmq.com/discord/" target="_blank" rel="noopener noreferrer">Discord Server</a>
                <a className={styles.btn} href="https://www.rabbitmq.com/slack/" target="_blank" rel="noopener noreferrer">Slack Channel</a>
                <br/><br/>
                <p>Meet your fellow Rabbits to share stories, advice, and get help.</p>
                <h2>Issues &amp; Bug Reports</h2>
                <p>Start by searching the <a href="https://groups.google.com/forum/#!forum/rabbitmq-users" target="_blank" rel="noopener noreferrer">Mailing List</a> archive and known issues on <a href="https://github.com/rabbitmq?q=rabbitmq" target="_blank" rel="noopener noreferrer">GitHub</a>. It’s very likely fellow users have raised the same issue. </p>
                <h2>Contributions</h2>
                <p>RabbitMQ welcomes contributions from the community. Please see our <a href="/docs/github">Contributors Page</a> to learn more.</p>
              </div>
            </div>
            <div className={[styles.column, styles.onethird].join(' ')}>
              <div className={styles.inner}>
                <div className={styles.container}>
                  <h1>Contact Us</h1>
                  <h2>Commercial inquiries</h2>
                  <p><a href="mailto:rabbitmq-sales@pivotal.io">VMware Sales</a> | <a href="https://tanzu.vmware.com/rabbitmq" target="_blank" rel="noopener noreferrer">VMware Support</a></p>
                  <h2>Other inquiries</h2>
                  <p><a href="/docs/contact">Contact us</a></p>
                  <h2>Report a security vulnerability</h2>
                  <p><a href="mailto:rabbitmq-core@groups.vmware.com">rabbitmq-core@groups.vmware.com</a></p>
                  <h2>Social media</h2>
                  <p><a href="https://twitter.com/RabbitMQ" target="_blank" rel="noopener noreferrer">Twitter</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
