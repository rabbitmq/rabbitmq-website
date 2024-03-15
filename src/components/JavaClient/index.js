import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function getActualVersion() {
  const {
    siteConfig: {
      customFields: {releaseBranches},
    },
  } = useDocusaurusContext();

  const version = releaseBranches['java'];
  return version;
}

export function JavaClientVersion() {
  const version = getActualVersion();
  return version;
}

export function JavaClientDocURL() {
  const url = `https://rabbitmq.github.io/rabbitmq-java-client/api/current/`;
  return url;
}
