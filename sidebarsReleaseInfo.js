/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  releaseInfoSidebar: [
    {
      type: 'doc',
      id: 'news',
      label: 'Project Announcements',
    },
    {
      type: 'doc',
      id: 'changelog',
      label: 'Changelog',
    },
    {
      type: 'doc',
      id: 'versions',
      label: 'Support Calendar',
    },
  ],
};

export default sidebars;
