// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RabbitMQ',
  tagline: 'RabbitMQ: easy to use, flexible messaging and streaming',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://rabbitmq-website.pages.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'rabbitmq', // Usually your GitHub org/user name.
  projectName: 'rabbitmq-website', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    versionPerBranch: {
      'Next': '3.13.0-rc.2',
      //'3.13.x': '3.13.0-rc.2'
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/rabbitmq/rabbitmq-website/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/rabbitmq/rabbitmq-website/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        // We do not define a title here because we only want the logo to
        // appear in the top-level area.
        // title: 'RabbitMQ',
        logo: {
          alt: 'RabbitMQ',
          src: 'img/logo-rabbitmq.svg',
        },
        items: [
          {to: '/docs/download', label: 'Download', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: 'https://tanzu.vmware.com/rabbitmq', label: 'Commercial Support', position: 'left'},
          /* TODO: Configure Algolia once documentation and blog are
           * configured.
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownItemsAfter: [{to: '/versions', label: 'All versions'}],
            dropdownActiveClassDisabled: true,
          },*/
          {
            href: 'https://github.com/rabbitmq/rabbitmq-website',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              /* TODO: List important doc sections once documentation is
               * configured.
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },*/
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://rabbitmq.com/discord/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/RabbitMQ',
              },
            ],
          },
          {
            title: 'More',
            items: [
              /* TODO: List blog once it is configured.
              {
                label: 'Blog',
                to: '/blog',
              },*/
              {
                label: 'GitHub',
                href: 'https://github.com/rabbitmq/rabbitmq-website',
              },
            ],
          },
        ],
        copyright: `Copyright © 2007-${new Date().getFullYear()} VMware, Inc. or its affiliates.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: '8E582XRSTF',

        // Public API key: it is safe to commit it
        apiKey: '4d18eb1048c0b8097b18934507a9e13f',

        indexName: 'rabbitmq-webpages',

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
        href: 'https://fonts.googleapis.com/css?family=Raleway:400,500,600,700',
      },
    },
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
