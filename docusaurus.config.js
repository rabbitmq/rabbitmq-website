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
  favicon: 'img/rabbitmq-logo.svg',

  // We need to force the trailing slash behavior to make it work with
  // CloudFlare pages.
  trailingSlash: false,

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
    releases: {
      rabbitmq: {
        // RabbitMQ releases per version declared in Docusaurus ('Next' for the
        // future docs).
        'Next': {
          version: '3.13.0-rc.3',
          // package_revs: {
          //   'debian': '1',
          //   'rpm-el8': '1',
          //   'rpm-suse': '1',
          // }
        },
        '3.12': { version: '3.12.11' },
        '3.11': { version: '3.11.28' },
        '3.10': { version: '3.10.25' },
      },

      // Client releases.
      java: '5.20.0',
      dotnot: '6.6.0',
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
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
          {to: '/#features', label: 'Features', position: 'left'},
          {to: '/#getstarted', label: 'Get Started', position: 'left'},
          {to: '/#support', label: 'Support', position: 'left'},
          {to: '/#community', label: 'Community', position: 'left'},
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
              {href: 'https://www.rabbitmq.com/documentation.html', label: '3.12'},
              {to: '/docs/versions', label: 'Release information'},
              //{type: 'html', value: '<strong>Unsupported</strong>'},
            ],
          },
          {
            label: 'GitHub',
            href: 'https://github.com/rabbitmq/rabbitmq-website',
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
              {
                label: 'Tutorials',
                to: '/docs/getstarted',
              },
              {
                label: 'Install',
                to: '/docs/download',
              },
            ],
          },
          {
            title: 'Community',
            items: [
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
                label: 'Twitter',
                href: 'https://twitter.com/RabbitMQ',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/rabbitmq/rabbitmq-website',
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
                to: '/docs/trademark-guidelines',
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
          'dart',
          'haskell',
          'julia',
          'perl',
          'ruby',
        ],
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
        href: 'https://fonts.googleapis.com/css?family=Raleway:400,700',
      },
    },
  ],

  markdown: {
    mermaid: true,
    preprocessor: ({filePath, fileContent}) => {

      const fs = require('fs');

      if (!fs.existsSync("./rabbitmq-tutorials")) {
        console.log("./rabbitmq-tutorials doesn't exist. Please fetch the submodule.");
        process.exit(1);
      }
      let languageExtensions = new Map([
        ['Python', {folder: 'python', extension: '.py'}],
        ['Java', {folder: 'java', extension: '.java'}],
        // ['C#', {folder: 'dotnet', extension: '.cs'}],
        ['Go', {folder: 'go', extension: '.go'}],
        ['Elixir', {folder: 'elixir', extension: '.exs'}],
        ['C++', {folder: 'cpp', extension: '.cpp'}],
        ['PHP', {folder: 'php', extension: '.php'}],
        ['Ruby', {folder: 'ruby', extension: '.rb'}],
        ['Erlang', {folder: 'erlang', extension: '.erl'}],

        // ['Scala', '.scala'],
        // ['Haskell', '.hs'],
        // ['Clojure', '.clj'],
        // ['CommonLisp', '.lisp'],
        // ['Julia', '.jl'],
        // ['Kotlin', '.kt'],
        // ['Dart', '.dart'],

        // Add more mappings as needed
      ]);

      const readfilecontentsync = (filepath) => {
        try {
          return fs.readFileSync(filepath, 'utf-8');
        } catch (error) {
          console.error(`error reading file at '${filepath}':`, error.message);
          throw error; // you might want to handle or log the error appropriately
        }
      };

      function includeFile(file) {
        const header = `<Tabs groupid="programming-language" queryString="lang">\n`;
        const other = `
<TabItem value="other" label="More...">
:::info
See the [rabbitmq-tutorials](https://github.com/rabbitmq/rabbitmq-tutorials/) for more languages, including C#, Scala, Kotlin, Haskell and more.
:::
</TabItem>`;
        const footer = `</Tabs>`;

        let items = "";
        languageExtensions.forEach((lang, langName) => {
          const path = `./rabbitmq-tutorials/${lang.folder}/${file}${lang.extension}`;
          const contents = readfilecontentsync(path);
          const s = `<TabItem value="${lang.folder}" label="${langName}">\n` + "```" + `${lang.folder}\n`;
          const m = contents;
          items += s + m + "\n```\n" + `</TabItem>` + "\n";
        } );
        let result = header + items + other + footer;

        return result;

      }

      const regex = /@RMQincludeFile\((.*?)\)/g;
      return fileContent.replaceAll(regex, function(match) {
        let file = match.substring(17, match.length - 2);
        return includeFile(file)});
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
