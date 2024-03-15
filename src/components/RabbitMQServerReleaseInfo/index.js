import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function getReleaseInfo() {
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

export function RabbitMQServerReleaseInfoTable() {
  const releases = getReleaseInfo();

  const now = Date.now();
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  var sawLatestRelease = false;

  var rows = [];
  for (const series in releases) {
    if (series == 'Next') {
      continue;
    }

    const release = releases[series];

    const isReleased = typeof release.first_release !== 'undefined';

    var links;
    if (isReleased) {
      links = [{
        label: "Release Notes",
        url: `https://github.com/rabbitmq/rabbitmq-server/releases/tag/v${release.version}`
      }];
      if (release.links) {
        links = links.concat(release.links);
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

    var initialReleaseDate;
    if (release.first_release) {
      const date = new Date(release.first_release);
      initialReleaseDate = date.toLocaleDateString("en-GB", dateOptions);
    } else {
      initialReleaseDate = <></>;
    }

    var endOfSupportDates = [];
    if (release.end_of_community_support) {
      endOfSupportDates.push(release.end_of_community_support);
    }
    if (release.end_of_commercial_support) {
      endOfSupportDates.push(release.end_of_commercial_support);
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
        <td class="release-series">{series}</td>
        <td class="release-patch">{release.version || "-"}</td>
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
          <th>Date of First Release</th>
          <th>End of Community Support</th>
          <th>End of Extended Commercial Support</th>
        </tr>

        {rows}

      </table>
      <p><strong>Legend:</strong></p>
      <ul className="release-legend">
        <li className="supported-releaase latest-release">Latest release, fully supported</li>
        <li className="supported-release">Older release, still supported but upgrade is recommended</li>
        <li className="unsupported-release">Old release, unsupported</li>
        {/*<li className="unsupported-release future-release">Future version, unsupported</li>*/}
      </ul>
    </div>);
}
