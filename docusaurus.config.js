// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

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
        // RabbitMQ releases per version declared in Docusaurus ('Next' for the
        // future docs).
        'Next': {
          // package_revs: {
          //   'debian': '1',
          //   'rpm-el8': '1',
          //   'rpm-suse': '1',
          // }
        },
        '3.13': {
          releases: [
            {
              version: '3.13.1',
              release_date: "2024-03-29",
            },
            {
              version: '3.13.0',
              release_date: "2024-02-22",
              links: [
                {
                  label: "Announcement",
                  url: "/blog/2024/03/11/rabbitmq-3.13.0-announcement"
                },
              ],
            },
          ],
          end_of_community_support: "2025-02-28",
          end_of_commercial_support: "2025-08-31",
        },
        '3.12': {
          releases: [
            {version: '3.12.13', release_date: "2024-02-16", },
            {version: '3.12.0', release_date: "2023-06-02", },
          ],
          end_of_community_support: "2024-06-30",
          end_of_commercial_support: "2024-12-31",
        },
        '3.11': {
          releases: [
            {version: '3.11.28', release_date: "2023-12-22", },
            {version: '3.11.0', release_date: "2022-09-28", },
          ],
          end_of_community_support: "2023-12-31",
          end_of_commercial_support: "2024-07-31",
        },
        '3.10': {
          releases: [
            {version: '3.10.25', release_date: "2023-07-18", },
            {version: '3.10.0', release_date: "2022-05-03", },
          ],
          end_of_community_support: "2022-05-03",
          end_of_commercial_support: "2023-12-31",
        },
      },

      // Client releases.
      java: '5.20.0',
      dotnet: '6.6.0',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // Pretend that the current/latest is 3.13.x. This should be
          // commentted out as soon as we want to publish docs for the next
          // branch (and 3.13.x docs should be branched).
          versions: {
            current: {
              label: '3.13', // "Next" by default.
            },
          },
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
        },
        theme: {
          customCss: './src/css/custom.css',
        },

        // User tracking: Google tag for Google Analytics.
        gtag: {
          trackingID: 'G-9SLB9X7PHR',
          anonymizeIP: true,
        },
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
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
        id: 'new-release',
        content: '<strong style="font-size: var(--ifm-h4-font-size);"><a href="/blog/2024/03/11/rabbitmq-3.13.0-announcement">RabbitMQ 3.13.0 is released!</a></strong>',
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
                href: 'https://www.rabbitmq.com/discord/',
              },
              {
                label: 'Slack',
                href: 'https://www.rabbitmq.com/slack/',
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
            ],
          },
        ],
        copyright: `Copyright © 2007-${new Date().getFullYear()} Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          'bash',
          'csharp',
          'elixir',
          'erlang',
          'go',
          'java',
          'json',
          'php',
          'powershell',
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

      // User tracking: OneTrust Cookie Consent popup.
      metadata: [
        {
          name: 'onetrust-data-domain',
          content: '73d8ba46-8c12-43f6-8c22-24aa21b8d93d',
        },
        {
          name: 'microsites-utag',
          content: 'https://tags.tiqcdn.com/utag/vmware/microsites-privacy/prod/utag.js',
        },
      ],
      headTags: [
        {
          tagName: 'script',
          attributes: { src: '//www.vmware.com/files/templates/inc/utag_data.js' },
        },
        {
          tagName: 'script',
          attributes: { src: '//tags.tiqcdn.com/utag/vmware/microsites-privacy/prod/utag.sync.js' },
        },
        {
          tagName: 'script',
          innerHTML: "function OptanonWrapper() { { window.dataLayer.push({ event: 'OneTrustGroupsUpdated' }); } }",
        },
      ],
    }),

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Raleway:400,700',
      },
    },
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
