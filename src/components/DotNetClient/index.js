import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function getActualVersion() {
  const {
    siteConfig: {
      customFields: {releases},
    },
  } = useDocusaurusContext();

  const version = releases['dotnet'];
  return version;
}

export function DotNetClientVersion() {
  const version = getActualVersion();
  return version;
}

export function DotNetClientDocRootURL() {
  const url = `https://rabbitmq.github.io/rabbitmq-dotnet-client`;
  return url;
}

export function DotNetClientDocURL() {
  const url = `${DotNetClientDocRootURL()}/api`;
  return url;
}
