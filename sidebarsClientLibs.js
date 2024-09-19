// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  clientLibsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Client Libraries',
    },
    {
      type: 'doc',
      id: 'amqp-client-libraries',
      label: 'AMQP 1.0',
    },
    {
      type: 'category',
      label: 'Java',
      link: {type: 'doc', id: 'java-client'},
      items: [
        {
          type: 'doc',
          id: 'java-api-guide',
          label: 'API guide',
        },
        {
          type: 'doc',
          id: 'jms-client',
          label: 'JMS client',
        },
        {
          type: 'doc',
          id: 'java-tools',
          label: 'Tools',
        },
        {
          type: 'doc',
          id: 'java-versions',
          label: 'Support information',
        },
      ],
    },
    {
      type: 'category',
      label: '.NET/C#',
      link: {type: 'doc', id: 'dotnet'},
      items: [
        {
          type: 'doc',
          id: 'dotnet-api-guide',
          label: 'API guide',
        },
      ],
    },
    {
      type: 'category',
      label: 'Erlang',
      link: {type: 'doc', id: 'erlang-client'},
      items: [
        {
          type: 'doc',
          id: 'erlang-client-user-guide',
          label: 'API guide',
        },
      ],
    },
    {
      type: 'doc',
      id: 'devtools',
      label: 'Developer tools',
    },
  ],
};

export default sidebars;
