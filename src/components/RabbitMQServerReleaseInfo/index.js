import React from 'react';
import { useState } from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useVersions } from '@docusaurus/plugin-content-docs/client';

import UnfoldIcon from './unfold-toggle.svg';

/*
 * The "Release Notes" icon comes from the Google Cloud Solutions Icons
 * collection and is published under the MIT license.
 * https://www.svgrepo.com/svg/375489/release-notes
 */
import RelnotesIcon from './release-notes.svg';

/*
 * The "Announcement" icon comes from the Office Business Bold Line Icons
 * collection by wirastudio and is published under a CC-BY license.
 * https://www.svgrepo.com/svg/341502/office-megaphone-speaker-loudspeaker-announce
 */
import AnnouncementIcon from './announcement.svg';

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
  const releaseBranch = releaseBranches[branch] || {};
  return releaseBranch;
}

export function getLatestRelease(branch) {
  const releaseBranch = getReleaseBranch(branch);
  if (typeof releaseBranch.releases === 'undefined') {
    return undefined;
  }

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
  const docusaurusVersions = useVersions();

  const now = Date.now();
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  var isLatestReleaseBranch = false;
  var previousReleaseBranch;

  const [whichShown, setWhichShown] = useState(undefined);

  var rows = [];
  for (const branch in releaseBranches) {
    const docusaurusVersion = docusaurusVersions.find((v) => v.name == branch);

    const releaseBranch = releaseBranches[branch];
    const releases = releaseBranch.releases || [];
    const isReleased = typeof releaseBranch.end_of_support !== 'undefined';
    var isLatestReleaseForBranch = true;
    if (isReleased && typeof previousReleaseBranch === 'undefined') {
      isLatestReleaseBranch = true;
    } else {
      isLatestReleaseBranch = false;
    }

    for (const releaseIndex in releases) {
      const release = releases[releaseIndex];
      const showClassName = (whichShown == branch) ?
        "show-release" : "hide-release";

      var latestReleaseBranchClassName = "";
      if (isLatestReleaseBranch) {
        latestReleaseBranchClassName = "latest-release";
      } else if (!isReleased) {
        latestReleaseBranchClassName = "future-release";
      }

      var links;
      if (isReleased) {
        links = [{
          type: "relnotes",
          url: getReleaseNotesURL(release),
        }];
        if (release.links) {
          links = links.concat(release.links);
        }

        links = (
          <ul>
            {
              links.map(function(link) {
                switch (link.type) {
                  case 'relnotes':
                    return (
                      <li>
                        <a href={link.url} className={[
                          "release-link",
                          `release-link-${link.type}`
                        ].join(' ')} >
                          <RelnotesIcon title="Release Notes"/>
                          <span>Release Notes</span>
                        </a>
                      </li>);
                  case 'announcement':
                    return (
                      <li>
                        <a href={link.url} className={[
                          "release-link",
                          `release-link-${link.type}`
                        ].join(' ')} >
                          <AnnouncementIcon title="Announcement"/>
                          <span>Announcement</span>
                        </a>
                      </li>);
                }
              })
            }
          </ul>);
      } else {
        links = <></>
      }

      var releaseDate;
      if (isReleased) {
        releaseDate = new Date(release.release_date);
        releaseDate = releaseDate.toLocaleDateString("en-GB", dateOptions);
      } else {
        releaseDate = "-";
      }

      var endOfSupportDates = ["-", "-"];
      var hasOSSSupport = false;
      if (releaseBranch.end_of_support) {
        /* Release branch is supported. */
        if (previousReleaseBranch) {
          const prevReleases = previousReleaseBranch.releases;
          const initialPrevRelease = prevReleases[prevReleases.length - 1];
          endOfSupportDates[0] = new Date(initialPrevRelease.release_date);
        } else {
          hasOSSSupport = true;
          endOfSupportDates[0] = <abbr title="Supported until the next major or minor release branch is published.">Next release</abbr>;
        }
        endOfSupportDates[1] = new Date(releaseBranch.end_of_support);
      }

      for (const i in endOfSupportDates) {
        const date = endOfSupportDates[i];

        var className;
        var content;
        if (date instanceof Date) {
          const supported = date > now;
          className = supported ? "supported-release" : "unsupported-release";
          content = date.toLocaleDateString("en-GB", dateOptions);
        } else {
          className = hasOSSSupport ?
            "supported-release" : "unsupported-release";
          content = date;
        }
        endOfSupportDates[i] = <div className={[
          "release-eos",
          i == 0 ? "release-eos-community" : "release-eos-commercial",
          className,
          latestReleaseBranchClassName,
          isLatestReleaseForBranch ? "" : showClassName
        ].join(' ')}>{content}</div>;
      }

      if (isLatestReleaseForBranch) {
        var releaseBranchLink;
        if (docusaurusVersion && isReleased) {
          const url = `${docusaurusVersion.path}/whats-new`;
          releaseBranchLink = <a href={url}>{docusaurusVersion.label}</a>;
        } else if (docusaurusVersion) {
          releaseBranchLink = docusaurusVersion.label;
        } else {
          releaseBranchLink = branch;
        }

        rows.push(
          <>
            <div className={[
              "release-toggle",
              latestReleaseBranchClassName,
              showClassName
            ].join(' ')}
              onClick={(e) => {
                setWhichShown(whichShown == branch ? undefined : branch);
              }}>
              <UnfoldIcon/>
            </div>
            <div className={[
              "release-branch",
              latestReleaseBranchClassName,
              isLatestReleaseForBranch ? "" : showClassName
            ].join(' ')}>{releaseBranchLink}</div>
          </>
        );
      }

      rows.push(
        <>
          <div className={[
            "release-version",
            latestReleaseBranchClassName,
            isLatestReleaseForBranch ? "" : showClassName
          ].join(' ')}>{release.version || "-"}</div>

          <div className={[
            "release-links",
            latestReleaseBranchClassName,
            isLatestReleaseForBranch ? "" : showClassName
          ].join(' ')}>{links}</div>

          <div className={[
            "release-reldate",
            latestReleaseBranchClassName,
            isLatestReleaseForBranch ? "" : showClassName
          ].join(' ')}>{releaseDate}</div>

          {endOfSupportDates}
        </>
      );

      isLatestReleaseForBranch = false;
    }

    if (isReleased) {
      previousReleaseBranch = releaseBranch;
    }
  }

  return (
    <div className="release-information">
      <div className="release-info-overflow">
        <div className="release-info-grid">
          <div className={[
            "release-info-header",
            "release-branch"
          ].join(' ')}>Release</div>

          <div className={[
            "release-info-header",
            "release-version"
          ].join(' ')}>Patch and associated docs</div>

          <div className={[
            "release-info-header",
            "release-reldate"
          ].join(' ')}>Date of Release</div>

          <div className={[
            "release-info-header",
            "release-eos",
            "release-eos-community"
          ].join(' ')}>End of Community Support</div>

          <div className={[
            "release-info-header",
            "release-eos",
            "release-eos-commercial"
          ].join(' ')}><a href="https://knowledge.broadcom.com/external/article/103829/clarification-on-what-eos-end-of-support.html">Commercial End of Service</a></div>

          {rows}
        </div>
      </div>

      <strong>Legend:</strong>
      <dl className="release-legend">
        <dt className="supported-releaase latest-release"></dt>
        <dd>Latest release, fully supported</dd>
        <dt className="unsupported-release"></dt>
        <dd>Old release, unsupported</dd>
        {(typeof releaseBranches['current'].releases !== 'undefined' &&
          releaseBranches['current'].releases.length > 0) ?
          <>
            <dt className="unsupported-release future-release"></dt>
            <dd>Future version, unsupported</dd>
          </> :
          <></>
        }
      </dl>
    </div>);
}
