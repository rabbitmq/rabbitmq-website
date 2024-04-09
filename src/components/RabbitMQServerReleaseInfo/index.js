import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function getReleaseBranches() {
  const {
    siteConfig: {
      customFields: {
        releaseBranches: {
          rabbitmq: releaseBranches
        },
      },
    },
  } = useDocusaurusContext();

  return releaseBranches;
}

export function getReleaseBranch(branch) {
  const releaseBranches = getReleaseBranches();
  const releaseBranch = releaseBranches[branch];
  return releaseBranch;
}

export function getLatestRelease(branch) {
  const releaseBranch = getReleaseBranch(branch);
  const release = releaseBranch.releases[0] || undefined;
  return release;
}

export function getLatestVersion(branch) {
  const release = getLatestRelease(branch);
  if (release === undefined) {
    return undefined;
  }
  return release.version;
}

export function getReleaseNotesURL(release) {
  const url = `https://github.com/rabbitmq/rabbitmq-server/releases/tag/v${release.version}`;
  return url;
}

export function RabbitMQServerReleaseInfoTable() {
  const releaseBranches = getReleaseBranches();

  const now = Date.now();
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  var sawLatestRelease = false;

  var rows = [];
  for (const branch in releaseBranches) {
    if (branch === 'Next') {
      continue;
    }

    const releaseBranch = releaseBranches[branch];
    const releases = releaseBranch.releases;
    const lastRelease = releases[0];

    const isReleased = typeof lastRelease.release_date !== 'undefined';

    var links;
    if (isReleased) {
      links = [{
        label: "Release Notes",
        url: getReleaseNotesURL(lastRelease),
      }];
      if (lastRelease.links) {
        links = links.concat(lastRelease.links);
      }

      links = (
        <ul className="release-links">
          {
            links.map(function(link) {
              return (<li><a href={link.url}>{link.label}</a></li>)
            })
          }
        </ul>);
    } else {
      links = <></>
    }

    const initialRelease = releases[releases.length - 1];
    var initialReleaseDate;
    if (initialRelease.release_date) {
      const date = new Date(initialRelease.release_date);
      initialReleaseDate = <a href={getReleaseNotesURL(initialRelease)}>{initialRelease.version} – {date.toLocaleDateString("en-GB", dateOptions)}</a>;
    } else {
      initialReleaseDate = <></>;
    }

    var endOfSupportDates = [];
    if (releaseBranch.end_of_community_support) {
      endOfSupportDates.push(releaseBranch.end_of_community_support);
    }
    if (releaseBranch.end_of_commercial_support) {
      endOfSupportDates.push(releaseBranch.end_of_commercial_support);
    }

    endOfSupportDates = endOfSupportDates.map(function(rawDate) {
      const date = new Date(rawDate);
      const supported = date > now;
      var className;
      if (supported) {
        className = "supported-release";
      } else {
        className = "unsupported-release";
      }
      return (
        <td className={`release-eos ${className}`}>{date.toLocaleDateString("en-GB", dateOptions)}</td>
      );
    });

    for (var i = endOfSupportDates.length; i < 2; ++i) {
      endOfSupportDates.push(<td className="release-eos unsupported-release">-</td>);
    }

    var latestReleaseClass = "";
    if (isReleased && !sawLatestRelease) {
      latestReleaseClass = "latest-release";
      sawLatestRelease = true;
    } else if (!isReleased) {
      latestReleaseClass = "future-release";
    }

    rows.push(
      <tr className={latestReleaseClass}>
        <td class="release-branch">{branch}</td>
        <td class="release-version">{lastRelease.version || "-"}</td>
        <td class="release-links">{links}</td>
        <td class="release-date">{initialReleaseDate}</td>
        {endOfSupportDates}
      </tr>
    );
  }

  return (
    <div className="release-information">
      <table>
        <tr>
          <th>Release</th>
          <th colspan="2">Latest Patch</th>
          <th>First Patch and Date of Release</th>
          <th>End of Community Support</th>
          <th>End of Extended Commercial Support</th>
        </tr>

        {rows}

      </table>

      <strong>Legend:</strong>
      <dl className="release-legend">
        <dt className="supported-releaase latest-release"></dt><dd>Latest release, fully supported</dd>
        <dt className="supported-release"></dt><dd>Older release, still supported but upgrade is recommended</dd>
        <dt className="unsupported-release"></dt><dd>Old release, unsupported</dd>
        {/*<dt className="unsupported-release future-release"></dt><dd>Future version, unsupported</dd>*/}
      </dl>
    </div>);
}
