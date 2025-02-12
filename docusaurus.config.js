// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import imgRendering from './src/rehype/img-rendering.js';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RabbitMQ',
  tagline: 'One broker to queue them all',
  favicon: 'img/rabbitmq-logo.svg',

  // We need to force the trailing slash behavior to make it work with
  // CloudFlare pages.
  trailingSlash: false,

  // Set the production url of your site here
  url: 'https://www.rabbitmq.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'rabbitmq', // Usually your GitHub org/user name.
  projectName: 'rabbitmq-website', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    releaseBranches: {
      rabbitmq: {
        // RabbitMQ releases per version declared in Docusaurus ('current' for
        // the future docs).
        'current': {
          releases: [
          ],
        },
        '4.0': {
          releases: [
            {version: '4.0.6', release_date: "2025-02-11", },
            {version: '4.0.5', release_date: "2024-12-15", },
            {version: '4.0.4', release_date: "2024-11-21", },
            {version: '4.0.3', release_date: "2024-10-28", },
            {version: '4.0.2', release_date: "2024-09-21", },
            {
              version: '4.0.1',
              release_date: "2024-09-18",
              links: [
                {
                  type: "announcement",
                  url: "/blog/tags/rabbit-mq-4-0"
                },
              ],
            },
          ],
          end_of_support: "2027-09-30",
        },
        '3.13': {
          releases: [
            {version: '3.13.7', release_date: "2024-08-26", },
            {version: '3.13.6', release_date: "2024-07-23", },
            {version: '3.13.5', release_date: "2024-07-19", },
            {version: '3.13.4', release_date: "2024-07-03", },
            {version: '3.13.3', release_date: "2024-05-31", },
            {version: '3.13.2', release_date: "2024-04-30", },
            {version: '3.13.1', release_date: "2024-03-29", },
            {
              version: '3.13.0',
              release_date: "2024-02-22",
              links: [
                {
                  type: "announcement",
                  url: "/blog/2024/03/11/rabbitmq-3.13.0-announcement"
                },
              ],
            },
          ],
          end_of_support: "2027-12-31",
        },
        '3.12': {
          releases: [
            {version: '3.12.14', release_date: "2024-05-06", },
            {version: '3.12.13', release_date: "2024-02-16", },
            {version: '3.12.12', release_date: "2024-01-09", },
            {version: '3.12.11', release_date: "2023-12-22", },
            {version: '3.12.10', release_date: "2023-11-21", },
            {version: '3.12.9', release_date: "2023-11-17", },
            {version: '3.12.8', release_date: "2023-11-01", },
            {version: '3.12.7', release_date: "2023-10-18", },
            {version: '3.12.6', release_date: "2023-09-22", },
            {version: '3.12.5', release_date: "2023-09-20", },
            {version: '3.12.4', release_date: "2023-08-24", },
            {version: '3.12.3', release_date: "2023-08-18", },
            {version: '3.12.2', release_date: "2023-07-18", },
            {version: '3.12.1', release_date: "2023-06-26", },
            {version: '3.12.0', release_date: "2023-06-02", },
          ],
          end_of_support: "2025-06-30",
        },
        '3.11': {
          releases: [
            {version: '3.11.28', release_date: "2023-12-22", },
            {version: '3.11.27', release_date: "2023-12-15", },
            {version: '3.11.26', release_date: "2023-11-20", },
            {version: '3.11.25', release_date: "2023-11-01", },
            {version: '3.11.24', release_date: "2023-10-18", },
            {version: '3.11.23', release_date: "2023-09-12", },
            {version: '3.11.22', release_date: "2023-08-24", },
            {version: '3.11.21', release_date: "2023-08-18", },
            {version: '3.11.20', release_date: "2023-07-18", },
            {version: '3.11.19', release_date: "2023-06-26", },
            {version: '3.11.18', release_date: "2023-06-07", },
            {version: '3.11.17', release_date: "2023-05-29", },
            {version: '3.11.16', release_date: "2023-05-13", },
            {version: '3.11.15', release_date: "2023-04-30", },
            {version: '3.11.14', release_date: "2023-04-29", },
            {version: '3.11.13', release_date: "2023-03-31", },
            {version: '3.11.12', release_date: "2023-03-30", },
            {version: '3.11.11', release_date: "2023-03-20", },
            {version: '3.11.10', release_date: "2023-03-02", },
            {version: '3.11.9', release_date: "2023-02-13", },
            {version: '3.11.8', release_date: "2023-01-30", },
            {version: '3.11.7', release_date: "2023-01-17", },
            {version: '3.11.6', release_date: "2023-01-05", },
            {version: '3.11.5', release_date: "2022-12-14", },
            {version: '3.11.4', release_date: "2022-11-29", },
            {version: '3.11.3', release_date: "2022-11-10", },
            {version: '3.11.2', release_date: "2022-10-19", },
            {version: '3.11.1', release_date: "2022-10-13", },
            {version: '3.11.0', release_date: "2022-09-28", },
          ],
          end_of_support: "2024-06-30",
        },
        '3.10': {
          releases: [
            {version: '3.10.25', release_date: "2023-07-18", },
            {version: '3.10.24', release_date: "2023-06-07", },
            {version: '3.10.23', release_date: "2023-05-25", },
            {version: '3.10.22', release_date: "2023-04-30", },
            {version: '3.10.21', release_date: "2023-04-29", },
            {version: '3.10.20', release_date: "2023-03-22", },
            {version: '3.10.19', release_date: "2023-03-02", },
            {version: '3.10.18', release_date: "2023-02-13", },
            {version: '3.10.17', release_date: "2023-01-31", },
            {version: '3.10.16', release_date: "2023-01-30", },
            {version: '3.10.15', release_date: "2023-01-30", },
            {version: '3.10.14', release_date: "2023-01-17", },
            {version: '3.10.13', release_date: "2022-12-14", },
            {version: '3.10.12', release_date: "2022-11-29", },
            {version: '3.10.11', release_date: "2022-11-10", },
            {version: '3.10.10', release_date: "2022-10-19", },
            {version: '3.10.9', release_date: "2022-10-13", },
            {version: '3.10.8', release_date: "2022-09-25", },
            {version: '3.10.7', release_date: "2022-08-02", },
            {version: '3.10.6', release_date: "2022-07-11", },
            {version: '3.10.5', release_date: "2022-06-06", },
            {version: '3.10.4', release_date: "2022-06-01", },
            {version: '3.10.2', release_date: "2022-05-20", },
            {version: '3.10.1', release_date: "2022-05-11", },
            {version: '3.10.0', release_date: "2022-05-03", },
          ],
          end_of_support: "2023-12-31",
        },
      },

      // Client releases.
      java: '5.24.0',
      dotnet: '7.0.0',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebarsDocs.js',

          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/rabbitmq/rabbitmq-website/tree/main/',
        },
        blog: {
          blogSidebarCount: 0,
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/rabbitmq/rabbitmq-website/tree/main/',
          rehypePlugins: [imgRendering],
          // silence a warning about older blog posts with Docusaurus 3.5.0+
          onUntruncatedBlogPosts: 'ignore'
        },
        theme: {
          customCss: './src/css/custom.css',
        }
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'tutorials',
        path: 'tutorials',
        routeBasePath: 'tutorials',
        sidebarPath: './sidebarsTutorials.js',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'release-information',
        path: 'release-information',
        routeBasePath: 'release-information',
        sidebarPath: './sidebarsReleaseInfo.js',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'kubernetes',
        path: 'kubernetes',
        routeBasePath: 'kubernetes',
        sidebarPath: './sidebarsKubernetes.js',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'client-libraries',
        path: 'client-libraries',
        routeBasePath: 'client-libraries',
        sidebarPath: './sidebarsClientLibs.js',
      },
    ],
    "./src/plugins/configure-svgo.js",
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      codeblock: {
        showGithubLink: true,
        githubLinkLabel: 'View on GitHub'
      },
      colorMode: {
        respectPrefersColorScheme: true
      },
      // Replace with your project's social card
      image: 'img/rabbitmq-social-media-card.svg',
      navbar: {
        // We do not define a title here because we only want the logo to
        // appear in the top-level area.
        // title: 'RabbitMQ',
        logo: {
          alt: 'RabbitMQ',
          src: 'img/rabbitmq-logo-with-name.svg',
        },
        items: [
          {to: '/tutorials', label: 'Getting Started', position: 'left'},
          {
            type: 'docSidebar',
            label: 'Docs',
            sidebarId: 'docsSidebar',
            position: 'left',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownItemsBefore: [
              {type: 'html', value: '<strong>Supported</strong>'},
            ],
            dropdownItemsAfter: [
              {href: 'https://v3-12.rabbitmq.com/documentation.html', label: '3.12'},
              {to: '/release-information', label: 'Release Information'},
              //{type: 'html', value: '<strong>Unsupported</strong>'},
            ],
          },
          {
            label: 'Support',
            to: '/contact',
          },
          {
            label: 'GitHub',
            href: 'https://github.com/rabbitmq/rabbitmq-website',
            position: 'right',
          },
        ],
      },
      announcementBar: {
        id: 'latest-announcement',
        content: '<strong style="font-size: var(--ifm-h4-font-size);"><a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.6">RabbitMQ 4.0.6 is out</a></strong>',
        backgroundColor: 'var(--ifm-color-primary-contrast-background)',
        textColor: 'var(--ifm-font-color-base)',
        isCloseable: true,
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn about RabbitMQ',
            items: [
              {
                label: 'Getting Started',
                to: '/tutorials',
              },
              {
                label: 'Documentation',
                to: '/docs',
              },
              {
                label: 'Blog',
                to: '/blog',
              },
            ],
          },
          {
            title: 'Reach out to the RabbitMQ team',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/rabbitmq',
              },
              {
                label: 'Mailing list',
                href: 'https://groups.google.com/forum/#!forum/rabbitmq-users',
              },
              {
                label: 'Discord',
                href: 'https://www.rabbitmq.com/discord',
              },
              {
                label: 'Slack',
                href: 'https://www.rabbitmq.com/slack',
              },
              {
                label: 'Contact us',
                to: '/contact',
              },
            ],
          },
          {
            title: 'Broadcom',
            items: [
              {
                label: 'VMware Tanzu',
                href: 'https://tanzu.vmware.com/',
              },
              {
                label: 'Terms of Use',
                href: 'https://www.vmware.com/help/legal.html',
              },
              {
                label: 'Privacy',
                href: 'https://www.vmware.com/help/privacy.html',
              },
              {
                label: 'Trademark Guidelines',
                to: '/trademark-guidelines',
              },
              {
                label: 'Your California Privacy Rights',
                href: 'https://www.vmware.com/help/privacy/california-privacy-rights.html',
              },
              {
                html: '<a class="footer__link-item ot-sdk-show-settings">Cookie Settings</a>',
              },
            ],
          },
        ],
        copyright: `Copyright © 2005-${new Date().getFullYear()} Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          'bash',
          'batch',
          'csharp',
          'elixir',
          'erlang',
          'go',
          'java',
          'json',
          'php',
          'PowerShell',
          'python',
          'shell-session',
          'yaml',
        ],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'H10VQIW16Y',

        // Public API key: it is safe to commit it
        apiKey: 'f23e8af89d899070974a643428531141',

        indexName: 'rabbitmq.com',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to
        // disable it)
        searchPagePath: 'search',
      },
    }),

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Raleway:400,700',
      },
    },
    {
      tagName: 'script',
      attributes: {
        src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
        'data-domain-script': "018ee308-473e-754f-b0c2-cbe82d25512f",
      },
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: "function OptanonWrapper() {}",
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: "function setGTM(w, d, s, l, i) { w[l] = w[l] || []; w[l].push({  'gtm.start': new Date().getTime(),  event: 'gtm.js' }); var f = d.getElementsByTagName(s)[0],  j = d.createElement(s),  dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f); } if (document.cookie.indexOf('OptanonConsent') > -1 && document.cookie.indexOf('groups=') > -1) { setGTM(window, document, 'script', 'dataLayer', 'GTM-TT84L8K'); } else { waitForOnetrustActiveGroups(); } var timer; function waitForOnetrustActiveGroups() { if (document.cookie.indexOf('OptanonConsent') > -1 && document.cookie.indexOf('groups=') > -1) {  clearTimeout(timer);  setGTM(window, document, 'script', 'dataLayer', 'GTM-TT84L8K'); } else {  timer = setTimeout(waitForOnetrustActiveGroups, 250); } }",
    },
  ],

  markdown: {
    mermaid: true,
  },
  themes: [
      '@docusaurus/theme-mermaid',
      'docusaurus-theme-github-codeblock'
  ],
};

export default config;
