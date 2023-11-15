import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';

function getActualVersion() {
  const {
    siteConfig: {
      customFields: {versionPerBranch},
    },
  } = useDocusaurusContext();

  const branch = useActiveVersion().label;
  const version = versionPerBranch[branch];
  return version;
}

export function RabbitMQServerVersion() {
  const version = getActualVersion();
  return version;
}

export function RabbitMQServerPackageURL({ packageType }) {
  const version = getActualVersion();
  const baseUrl = `https://github.com/rabbitmq/rabbitmq-server/releases/download/v${version}`;
  switch (packageType) {
    case 'debian':
      return `${baseUrl}/rabbitmq-server_${version}-1_all.deb`;
    case 'rpm-el8':
      return `${baseUrl}/rabbitmq-server-${version}-1.el8.noarch.rpm`;
    case 'rpm-suse':
      return `${baseUrl}/rabbitmq-server-${version}-1.suse.noarch.rpm`;
    case 'generic-unix':
      return `${baseUrl}/rabbitmq-server-generic-unix-${version}.tar.xz`;
    case 'windows-installer':
      return `${baseUrl}/rabbitmq-server-${version}.exe`;
    case 'windows-zip':
      return `${baseUrl}/rabbitmq-server-windows-${version}.zip`;
    default:
      throw new Error(`Unknown RabbitMQ server package type ${package_type}`);
  }
}

export function RabbitMQServerPackageFilename(props) {
  const url = RabbitMQServerPackageURL(props);
  const basename = url.split('/').reverse()[0];
  return basename;
}

export function RabbitMQServerPackageGenUnixDir() {
  const version = getActualVersion();
  const dir = `rabbitmq_${version}`;
  return dir;
}
