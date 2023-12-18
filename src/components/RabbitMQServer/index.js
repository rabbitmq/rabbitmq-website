import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';

function getReleasesInfo() {
  const {
    siteConfig: {
      customFields: {
        releases: {
          rabbitmq: releases
        },
      },
    },
  } = useDocusaurusContext();

  return releases;
}

function getBranchOrDefault({ branch } = { branch: undefined }) {
  if (branch === undefined) {
    branch = useActiveVersion().label;
  }

  return branch;
}

function getActualVersion(props) {
  const releases = getReleasesInfo();
  const branch = getBranchOrDefault(props);

  const version = releases[branch].version;
  return version;
}

function getPackageRevision(props) {
  const releases = getReleasesInfo();
  const branch = getBranchOrDefault(props);

  var package_rev;
  if ('package_revs' in releases[branch] &&
    packageType in releases[branch]['package_revs']) {
    const { packageType } = props;
    package_rev = releases[branch]['package_revs'][packageType];
  } else {
    package_rev = '1';
  }

  return package_rev;
}

export function RabbitMQServerProductName() {
  return 'RabbitMQ';
}

export function RabbitMQServerVersion(props = {}) {
  const version = getActualVersion(props);
  return version;
}

export function RabbitMQServerGitTag(props = {}) {
  const version = getActualVersion(props);
  const tag = `v${version}`;
  return tag;
}

export function RabbitMQServerPackageURL(props) {
  const { packageType } = props;
  const version = getActualVersion(props);
  const tag = RabbitMQServerGitTag();
  const baseUrl = `https://github.com/rabbitmq/rabbitmq-server/releases/download/${tag}`;
  switch (packageType) {
    case 'debian':
      const debian_rev = getPackageRevision(packageType);
      return `${baseUrl}/rabbitmq-server_${version.replaceAll('-', '.')}-${debian_rev}_all.deb`;
    case 'rpm-el8':
      const rpm_el8_rev = getPackageRevision(packageType);
      return `${baseUrl}/rabbitmq-server-${version.replaceAll('-', '.')}-${rpm_el8_rev}.el8.noarch.rpm`;
    case 'rpm-suse':
      const rpm_suse_rev = getPackageRevision(packageType);
      return `${baseUrl}/rabbitmq-server-${version.replaceAll('-', '.')}-${rpm_suse_rev}.suse.noarch.rpm`;
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

export function RabbitMQServerPackageRevision(props) {
  const { packageType } = props;
  switch (packageType) {
    case 'debian':
      const debian_rev = getPackageRevision(packageType);
      return debian_rev;
    case 'rpm-el8':
      const rpm_el8_rev = getPackageRevision(packageType);
      return rpm_el8_rev;
    case 'rpm-suse':
      const rpm_suse_rev = getPackageRevision(packageType);
      return rpm_suse_rev;
    default:
      throw new Error(`No package revision for package type ${package_type}`);
  }
}

export function RabbitMQServerPackageFilename(props) {
  const url = RabbitMQServerPackageURL(props);
  const basename = url.split('/').reverse()[0];
  return basename;
}

export function RabbitMQServerPackageGenUnixDir(props = {}) {
  const version = getActualVersion(props);
  const dir = `rabbitmq_${version}`;
  return dir;
}

export function RabbitMQServerPackageWinZipDir(props = {}) {
  return RabbitMQServerPackageGenUnixDir(props);
}
